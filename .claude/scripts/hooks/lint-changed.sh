#!/usr/bin/env bash
# Runs Biome linting on changed files

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.tool_input?.file_path || '')")

# Skip if not a lintable file
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

echo "🔍 Running Biome on $FILE_PATH..." >&2

if ! pnpm biome check "$FILE_PATH" 2>&1; then
  echo "❌ Biome check failed" >&2
  exit 2
fi

echo "✅ Biome check passed!" >&2
exit 0
