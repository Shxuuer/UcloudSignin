const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const HEARTBEAT_INTERVAL = 10000;

app.use(express.static("./"));
app.use(express.json());

let lastScanTs = 0;
let lastData = null;

function broadcast(payload) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}

function heartbeat() {
  this.isAlive = true;
}

app.post("/scan", (req, res) => {
  const payload = req.body;
  lastScanTs = Date.now();
  lastData = payload.data;
  console.log("[scan]", new Date().toISOString(), "content:", payload.data);
  broadcast({ status: "ok", data: payload.data, ts: lastScanTs });
  res.json({ ok: true });
});

wss.on("connection", (ws) => {
  console.log("[ws] 监听客户端已连接");
  ws.isAlive = true;
  ws.on("pong", heartbeat);
});

const heartbeatTimer = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      ws.terminate();
      return;
    }

    ws.isAlive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL);

wss.on("close", () => {
  clearInterval(heartbeatTimer);
});

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`服务启动 http://0.0.0.0:${PORT}`);
});
