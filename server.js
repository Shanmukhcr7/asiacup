import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Serve static files (index.html, styles, etc.)
app.use(express.static(path.join(__dirname, "public")));

// WebSocket server
const wss = new WebSocketServer({ server });
let viewerCount = 0;

wss.on("connection", (ws) => {
  viewerCount++;
  console.log("New client connected. Viewers:", viewerCount);

  // Send updated count to all clients
  broadcast({ type: "viewerCount", count: viewerCount });

  ws.on("close", () => {
    viewerCount--;
    console.log("Client disconnected. Viewers:", viewerCount);
    broadcast({ type: "viewerCount", count: viewerCount });
  });
});

// Broadcast helper
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

// Fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
