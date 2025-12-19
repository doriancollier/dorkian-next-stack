---
description: Check if the roadmap visualization server is running
argument-hint: "(no arguments)"
allowed-tools: Bash
category: roadmap
---

# Roadmap Status

Check whether the roadmap visualization server is currently running.

## Usage

```
/roadmap:status
```

## Implementation

```bash
PID_FILE="roadmap/.server.pid"
PORT_FILE="roadmap/.server.port"

echo "Roadmap Server Status"
echo "====================="
echo ""

if [ ! -f "$PID_FILE" ]; then
  echo "Status: NOT RUNNING"
  echo ""
  echo "No server has been started via /roadmap:open"
  echo "Run /roadmap:open to start the visualization server."
  exit 0
fi

PID=$(cat "$PID_FILE")
PORT=$(cat "$PORT_FILE" 2>/dev/null || echo "unknown")

if ps -p $PID > /dev/null 2>&1; then
  echo "Status: RUNNING"
  echo ""
  echo "  PID:  $PID"
  echo "  Port: $PORT"
  echo "  URL:  http://localhost:$PORT/roadmap.html"
  echo ""
  echo "Commands:"
  echo "  /roadmap:close  - Stop the server"
  echo "  /roadmap:open   - Open browser (server already running)"
else
  echo "Status: STALE"
  echo ""
  echo "PID file exists but process is not running."
  echo "  Stale PID: $PID"
  echo "  Stale Port: $PORT"
  echo ""
  echo "Cleaning up stale files..."
  rm -f "$PID_FILE" "$PORT_FILE"
  echo "Done. Run /roadmap:open to start a new server."
fi
```

## Output Examples

### Server Running

```
Roadmap Server Status
=====================

Status: RUNNING

  PID:  12345
  Port: 8765
  URL:  http://localhost:8765/roadmap.html

Commands:
  /roadmap:close  - Stop the server
  /roadmap:open   - Open browser (server already running)
```

### Server Not Running

```
Roadmap Server Status
=====================

Status: NOT RUNNING

No server has been started via /roadmap:open
Run /roadmap:open to start the visualization server.
```

### Stale PID File

```
Roadmap Server Status
=====================

Status: STALE

PID file exists but process is not running.
  Stale PID: 12345
  Stale Port: 8765

Cleaning up stale files...
Done. Run /roadmap:open to start a new server.
```
