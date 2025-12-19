/**
 * MCP Tool Handler Implementations
 *
 * Implements all database tools available through the MCP server.
 * Each tool performs specific database operations with appropriate
 * security checks and logging.
 *
 * NOTE: This module requires direct Prisma access for raw SQL operations.
 * This is intentional and necessary for the MCP server functionality.
 */

import { z } from 'zod';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import {
  classifySQL,
  isSelectOnly,
  isDMLOnly,
  addLimitToSelect,
  validateSQLSyntax,
  redactSensitiveData,
} from '../lib/sql-parser';
import {
  logMCPOperation,
  logSQL,
  logAccessDenied,
  getTimestamp,
  measureDuration,
} from '../lib/logging';
import {
  isLocalhost,
  getRequestIp,
  isMCPEnabled,
  isDevelopment,
  getConfigInt,
} from '../lib/security';
import { MCP_CONFIG, ERROR_MESSAGES } from '../config/constants';

// ============================================================================
// Types for MCP Server
// ============================================================================

/**
 * MCP Server interface - matches the mcp-handler server API
 */
interface MCPServer {
  tool<TSchema extends Record<string, z.ZodType>>(
    name: string,
    description: string,
    schema: TSchema,
    handler: (args: z.infer<z.ZodObject<TSchema>>) => Promise<MCPToolResponse>
  ): void;
}

/**
 * MCP Tool response format
 */
interface MCPToolResponse {
  content: Array<{ type: 'text'; text: string | undefined }>;
}

// ============================================================================
// Database Query Result Types
// ============================================================================

interface TableRow {
  table_name: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface DetailedColumnInfo extends ColumnInfo {
  character_maximum_length: number | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
}

interface PrimaryKeyRow {
  column_name: string;
}

interface ForeignKeyRow {
  column_name: string;
  ref_table: string;
  ref_column: string;
}

interface RowCountResult {
  count: bigint;
}

interface IndexRow {
  index_name: string;
  column_name: string;
  is_unique: boolean;
  is_primary: boolean;
}

interface ConstraintRow {
  constraint_name: string;
  constraint_type: string;
}

interface IndexInfo {
  name: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
}

// ============================================================================
// Tool Parameter Types
// ============================================================================

interface TableDetailsParams {
  table: string;
}

interface SelectQueryParams {
  sql: string;
  params?: unknown[];
  rowLimit?: number;
}

interface MutationQueryParams {
  sql: string;
  params?: unknown[];
  requireReason: string;
}

interface ExplainQueryParams {
  sql: string;
}

interface ValidateSqlParams {
  sql: string;
}

// ============================================================================
// Access Validation
// ============================================================================

/**
 * Validate access for all operations
 */
async function validateAccess(): Promise<{
  allowed: boolean;
  error?: string;
  ip?: string;
}> {
  // Check environment
  if (!isDevelopment()) {
    logAccessDenied('Not in development environment');
    return { allowed: false, error: ERROR_MESSAGES.NOT_DEVELOPMENT };
  }

  // Check if MCP is enabled
  if (!isMCPEnabled()) {
    logAccessDenied('MCP_DEV_ONLY_DB_ACCESS is not enabled');
    return { allowed: false, error: ERROR_MESSAGES.NOT_ENABLED };
  }

  // Check localhost
  const isLocal = await isLocalhost();
  if (!isLocal) {
    const ip = await getRequestIp();
    logAccessDenied('Non-localhost access attempt', ip);
    return { allowed: false, error: ERROR_MESSAGES.NOT_LOCALHOST, ip };
  }

  return { allowed: true };
}

// ============================================================================
// Tool Registration
// ============================================================================

/**
 * Register all MCP database tools
 */
export function registerTools(server: MCPServer): void {
  // Health check tool
  server.tool(
    'health',
    'Check MCP server health and configuration',
    {},
    async () => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      logMCPOperation({
        timestamp: getTimestamp(),
        tool: 'health',
        durationMs: measureDuration(startTime),
      });

      return {
        content: [
          {
            type: 'text',
            text: 'MCP server is healthy and ready to accept commands',
          },
        ],
      };
    }
  );

  // Get schema overview tool
  server.tool(
    'get_schema_overview',
    'Get high-level overview of database schema with table row counts',
    {},
    async () => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      try {
        // Get tables
        const tables = await prisma.$queryRaw<TableRow[]>`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `;

        const schema = [];

        for (const table of tables) {
          // Get columns
          const columns = await prisma.$queryRaw<ColumnInfo[]>`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = ${table.table_name}
            ORDER BY ordinal_position
          `;

          // Get primary keys
          const primaryKeys = await prisma.$queryRaw<PrimaryKeyRow[]>`
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = ${table.table_name}
            ORDER BY kcu.ordinal_position
          `;

          // Get foreign keys
          const foreignKeys = await prisma.$queryRaw<ForeignKeyRow[]>`
            SELECT
              kcu.column_name,
              ccu.table_name AS ref_table,
              ccu.column_name AS ref_column
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = ${table.table_name}
            ORDER BY kcu.ordinal_position
          `;

          // Get approximate row count
          const rowCount = await prisma.$queryRaw<RowCountResult[]>`
            SELECT COUNT(*) as count FROM ${Prisma.raw(`"${table.table_name}"`)}
          `;

          schema.push({
            table: table.table_name,
            rowCount: Number(rowCount[0]?.count || 0),
            columns: columns.map((col) => ({
              name: col.column_name,
              type: col.data_type,
              isNullable: col.is_nullable === 'YES',
              default: col.column_default,
            })),
            primaryKey: primaryKeys.map((pk) => pk.column_name),
            foreignKeys: foreignKeys.map((fk) => ({
              column: fk.column_name,
              references: {
                table: fk.ref_table,
                column: fk.ref_column,
              },
            })),
          });
        }

        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'get_schema_overview',
          durationMs: measureDuration(startTime),
          rowCount: schema.length,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ tables: schema }, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'get_schema_overview',
          durationMs: measureDuration(startTime),
          error: errorMsg,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error getting schema overview: ${errorMsg}`,
            },
          ],
        };
      }
    }
  );

  // Get table details tool
  server.tool(
    'get_table_details',
    'Get detailed information about a specific table',
    {
      table: z.string().describe('Table name to get details for'),
    },
    async ({ table }: TableDetailsParams) => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      try {
        // Get columns with more details
        const columns = await prisma.$queryRaw<DetailedColumnInfo[]>`
          SELECT
            column_name,
            data_type,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = ${table}
          ORDER BY ordinal_position
        `;

        if (columns.length === 0) {
          throw new Error(`Table '${table}' not found`);
        }

        // Get indexes
        const indexes = await prisma.$queryRaw<IndexRow[]>`
          SELECT
            i.relname AS index_name,
            a.attname AS column_name,
            ix.indisunique AS is_unique,
            ix.indisprimary AS is_primary
          FROM pg_class t
          JOIN pg_index ix ON t.oid = ix.indrelid
          JOIN pg_class i ON ix.indexrelid = i.oid
          JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
          JOIN pg_namespace n ON n.oid = t.relnamespace
          WHERE n.nspname = 'public'
          AND t.relname = ${table}
          AND t.relkind = 'r'
          ORDER BY i.relname, a.attnum
        `;

        // Get constraints
        const constraints = await prisma.$queryRaw<ConstraintRow[]>`
          SELECT constraint_name, constraint_type
          FROM information_schema.table_constraints
          WHERE table_schema = 'public'
          AND table_name = ${table}
          ORDER BY constraint_name
        `;

        // Get row count
        const rowCount = await prisma.$queryRaw<RowCountResult[]>`
          SELECT COUNT(*) as count FROM ${Prisma.raw(`"${table}"`)}
        `;

        // Get sample rows (limit 5)
        const sampleRows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
          `SELECT * FROM "${table}" LIMIT 5`
        );

        const details = {
          table,
          rowCount: Number(rowCount[0]?.count || 0),
          columns: columns.map((col) => ({
            name: col.column_name,
            type: col.data_type,
            maxLength: col.character_maximum_length,
            precision: col.numeric_precision,
            scale: col.numeric_scale,
            isNullable: col.is_nullable === 'YES',
            default: col.column_default,
          })),
          indexes: indexes.reduce<IndexInfo[]>((acc, idx) => {
            const existing = acc.find((i) => i.name === idx.index_name);
            if (existing) {
              existing.columns.push(idx.column_name);
            } else {
              acc.push({
                name: idx.index_name,
                columns: [idx.column_name],
                isUnique: idx.is_unique,
                isPrimary: idx.is_primary,
              });
            }
            return acc;
          }, []),
          constraints: constraints.map((c) => ({
            name: c.constraint_name,
            type: c.constraint_type,
          })),
          sampleRows: Array.isArray(sampleRows) ? sampleRows.slice(0, 5) : [],
        };

        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'get_table_details',
          durationMs: measureDuration(startTime),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(details, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'get_table_details',
          durationMs: measureDuration(startTime),
          error: errorMsg,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error getting table details: ${errorMsg}`,
            },
          ],
        };
      }
    }
  );

  // Execute SELECT query tool
  server.tool(
    'execute_sql_select',
    'Execute a SELECT query (read-only)',
    {
      sql: z.string().describe('SELECT SQL query to execute'),
      params: z
        .array(z.unknown())
        .optional()
        .describe('Query parameters for parameterized queries'),
      rowLimit: z
        .number()
        .min(1)
        .max(MCP_CONFIG.MAX_ROWS)
        .optional()
        .describe(
          `Maximum rows to return (default ${MCP_CONFIG.DEFAULT_LIMIT}, max ${MCP_CONFIG.MAX_ROWS})`
        ),
    },
    async ({ sql, params, rowLimit }: SelectQueryParams) => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      // Validate SQL is SELECT only
      if (!isSelectOnly(sql)) {
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_select',
          error: 'Not a SELECT statement',
        });
        return {
          content: [
            {
              type: 'text',
              text: ERROR_MESSAGES.NOT_SELECT,
            },
          ],
        };
      }

      try {
        const limit =
          rowLimit ||
          getConfigInt('MCP_DEFAULT_LIMIT', MCP_CONFIG.DEFAULT_LIMIT);
        const limitedSQL = addLimitToSelect(sql, limit);

        logSQL(limitedSQL, params);

        // Set statement timeout
        const timeoutMs = getConfigInt(
          'MCP_STMT_TIMEOUT_MS',
          MCP_CONFIG.STATEMENT_TIMEOUT_MS
        );
        await prisma.$executeRawUnsafe(`SET statement_timeout = ${timeoutMs}`);

        // Execute query
        const result =
          params && params.length > 0
            ? await prisma.$queryRawUnsafe(limitedSQL, ...params)
            : await prisma.$queryRawUnsafe(limitedSQL);

        const rows = Array.isArray(result) ? result : [];

        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_select',
          statementClass: 'SELECT',
          durationMs: measureDuration(startTime),
          rowCount: rows.length,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(rows, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_select',
          statementClass: 'SELECT',
          durationMs: measureDuration(startTime),
          error: errorMsg,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error executing SELECT: ${errorMsg}`,
            },
          ],
        };
      }
    }
  );

  // Execute DML mutation tool
  server.tool(
    'execute_sql_mutation',
    'Execute INSERT, UPDATE, or DELETE queries',
    {
      sql: z
        .string()
        .describe('DML SQL query to execute (INSERT, UPDATE, or DELETE)'),
      params: z
        .array(z.unknown())
        .optional()
        .describe('Query parameters for parameterized queries'),
      requireReason: z
        .string()
        .describe('Brief explanation of why this mutation is needed'),
    },
    async ({ sql, params, requireReason }: MutationQueryParams) => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      // Validate SQL is DML only (not SELECT, not DDL)
      if (!isDMLOnly(sql)) {
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_mutation',
          error: 'Not a valid DML statement',
        });
        return {
          content: [
            {
              type: 'text',
              text: ERROR_MESSAGES.NOT_DML,
            },
          ],
        };
      }

      try {
        const classification = classifySQL(sql);

        logSQL(sql, params);
        console.log('[MCP_DB] Mutation reason:', requireReason);

        // Set statement timeout
        const timeoutMs = getConfigInt(
          'MCP_STMT_TIMEOUT_MS',
          MCP_CONFIG.STATEMENT_TIMEOUT_MS
        );
        await prisma.$executeRawUnsafe(`SET statement_timeout = ${timeoutMs}`);

        // Check if query has RETURNING clause
        const hasReturning = sql.toUpperCase().includes('RETURNING');

        let rowCount = 0;
        let returning: unknown[] | undefined = undefined;

        if (hasReturning) {
          // Use queryRaw for RETURNING clause
          const rows =
            params && params.length > 0
              ? await prisma.$queryRawUnsafe(sql, ...params)
              : await prisma.$queryRawUnsafe(sql);

          returning = Array.isArray(rows) ? rows : [];
          rowCount = returning.length;
        } else {
          // Use executeRaw for non-RETURNING
          rowCount =
            params && params.length > 0
              ? await prisma.$executeRawUnsafe(sql, ...params)
              : await prisma.$executeRawUnsafe(sql);
        }

        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_mutation',
          statementClass: classification.statementType,
          durationMs: measureDuration(startTime),
          rowCount,
          reason: requireReason,
        });

        const response: { rowCount: number; returning?: unknown[] } = {
          rowCount,
        };
        if (returning) {
          response.returning = returning;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_mutation',
          durationMs: measureDuration(startTime),
          error: errorMsg,
          reason: requireReason,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error executing mutation: ${errorMsg}`,
            },
          ],
        };
      }
    }
  );

  // Explain query tool
  server.tool(
    'explain_query',
    'Explain a SELECT query with cost estimates',
    {
      sql: z.string().describe('SELECT SQL query to explain'),
    },
    async ({ sql }: ExplainQueryParams) => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      // Validate SQL is SELECT only
      if (!isSelectOnly(sql)) {
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'explain_query',
          error: 'Not a SELECT statement',
        });
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Only SELECT statements can be explained',
            },
          ],
        };
      }

      try {
        const explainSQL = `EXPLAIN (FORMAT JSON, ANALYZE FALSE, COSTS TRUE) ${sql}`;

        logSQL(redactSensitiveData(explainSQL));

        const result = await prisma.$queryRawUnsafe<
          Array<{ 'QUERY PLAN': unknown }>
        >(explainSQL);

        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'explain_query',
          statementClass: 'EXPLAIN',
          durationMs: measureDuration(startTime),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result[0], null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'explain_query',
          durationMs: measureDuration(startTime),
          error: errorMsg,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error explaining query: ${errorMsg}`,
            },
          ],
        };
      }
    }
  );

  // Validate SQL tool
  server.tool(
    'validate_sql',
    'Validate SQL syntax without executing',
    {
      sql: z.string().describe('SQL query to validate'),
    },
    async ({ sql }: ValidateSqlParams) => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      const result = validateSQLSyntax(sql);

      logMCPOperation({
        timestamp: getTimestamp(),
        tool: 'validate_sql',
        statementClass: result.statementType,
        durationMs: measureDuration(startTime),
        error: result.error,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}
