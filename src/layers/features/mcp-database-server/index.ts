/**
 * MCP Database Server Feature
 * 
 * Public API for the MCP database server feature.
 * This module provides controlled database access for AI agents
 * during development.
 */

// Main server export
export { createMcpServer } from './api/server';

// Types and interfaces (if needed by consumers)
export type { ParseResult } from './lib/sql-parser';
export type { LogEntry } from './lib/logging';
export type { StatementType } from './config/constants';

// Configuration exports
export { MCP_CONFIG, ERROR_MESSAGES } from './config/constants';

// Utility exports (optional, for advanced usage)
export {
  validateSQLSyntax,
  isSelectOnly,
  isDMLOnly,
  redactSensitiveData,
} from './lib/sql-parser';

export {
  isLocalhost,
  isDevelopment,
  isMCPEnabled,
} from './lib/security';