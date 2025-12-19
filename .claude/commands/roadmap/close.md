---
description: Stop the roadmap visualization server
argument-hint: "(no arguments)"
allowed-tools: Bash
category: roadmap
---

# Roadmap Close

Stop the HTTP server that was started by `/roadmap:open`.

## Usage

```
/roadmap:close
```

## Implementation

### Step 1: Check for PID File

```bash
PID_FILE="roadmap/.server.pid"
PORT_FILE="roadmap/.server.port"

if [ ! -f "$PID_FILE" ]; then
  echo "No roadmap server PID file found."
  echo "The server may not be running, or was started manually."
  echo ""
  echo "To find and kill manually started servers:"
  echo "  pkill -f 'python3 -m http.server'"
  exit 1
fi
```

### Step 2: Read PID and Check Process

```bash
PID=$(cat "$PID_FILE")

if ! ps -p $PID > /dev/null 2>&1; then
  echo "Server process (PID: $PID) is not running."
  echo "Cleaning up stale PID file..."
  rm -f "$PID_FILE" "$PORT_FILE"
  exit 0
fi
```

### Step 3: Kill the Server

```bash
PORT=$(cat "$PORT_FILE" 2>/dev/null || echo "unknown")

kill $PID

# Wait a moment and verify
sleep 1

if ps -p $PID > /dev/null 2>&1; then
  echo "Server didn't stop gracefully, forcing..."
  kill -9 $PID
fi
```

### Step 4: Clean Up

```bash
rm -f "$PID_FILE" "$PORT_FILE"

echo "Roadmap server stopped."
echo "  - PID: $PID"
echo "  - Port: $PORT"
```

## Notes

- Only stops servers started via `/roadmap:open`
- Cleans up PID and port files after stopping
- Handles stale PID files gracefully
- For manually started servers, use: `pkill -f 'python3 -m http.server'`
