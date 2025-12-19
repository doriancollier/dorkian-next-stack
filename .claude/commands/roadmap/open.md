---
description: Open the roadmap visualization in a browser
argument-hint: "(no arguments)"
allowed-tools: Bash
category: roadmap
---

# Roadmap Open

Start a local HTTP server and open the roadmap visualization in your default browser.

## Usage

```
/roadmap:open
```

## Implementation

### Step 1: Check if Server Already Running

Check if a server is already running by reading the PID file:

```bash
PID_FILE="roadmap/.server.pid"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if ps -p $PID > /dev/null 2>&1; then
    # Server already running, get port from file
    PORT_FILE="roadmap/.server.port"
    PORT=$(cat "$PORT_FILE" 2>/dev/null || echo "8765")
    echo "Roadmap server already running at http://localhost:$PORT/roadmap.html (PID: $PID)"
    open "http://localhost:$PORT/roadmap.html"
    exit 0
  fi
fi
```

### Step 2: Find Available Port

```bash
PORT=8765
for p in 8765 8766 8767 8768 8769 8770; do
  if ! lsof -i :$p > /dev/null 2>&1; then
    PORT=$p
    break
  fi
done
```

### Step 3: Start HTTP Server

```bash
cd roadmap
python3 -m http.server $PORT &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 1

# Save PID and port for later
echo $SERVER_PID > roadmap/.server.pid
echo $PORT > roadmap/.server.port
```

### Step 4: Open Browser

```bash
open "http://localhost:$PORT/roadmap.html"
```

### Step 5: Report to User

```bash
echo ""
echo "Roadmap server started at http://localhost:$PORT/roadmap.html"
echo "Server PID: $SERVER_PID"
echo ""
echo "To stop the server, run: /roadmap:close"
echo "To check status, run: /roadmap:status"
```

## Notes

- The server runs in the background until stopped with `/roadmap:close`
- Uses Python's built-in HTTP server (no dependencies)
- Works on macOS (uses `open` command)
- Port auto-selects if default (8765) is in use
- PID stored in `roadmap/.server.pid` for clean shutdown
- Idempotent: if server already running, just opens browser
