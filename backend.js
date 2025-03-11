const https = require("https");
const fs = require("fs");
const path = require("path");
const url = require("url");

const privateKey = fs.readFileSync(path.join(__dirname, "server.key"), "utf8");
const certificate = fs.readFileSync(
  path.join(__dirname, "server.cert"),
  "utf8"
);
const credentials = { key: privateKey, cert: certificate };

let lastUpdateTime = undefined;
let lastData = {
  id: 0,
  siteId: 0,
  classLessonId: 0,
};

function getIndex(res) {
  fs.readFile(path.join(__dirname, "index.html"), "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
}

function newData(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const data = JSON.parse(body).data;
    // 检查接收到的数据
    const reg =
      /checkwork\|id=(\d+)&siteId=(\d+)&createTime=(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{2})&classLessonId=(\d+)/;
    if (!reg.test(data)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request");
      return;
    }
    // 保存除了时间之外的数据
    const match = data.match(reg);
    lastData = {
      id: parseInt(match[1]),
      siteId: parseInt(match[2]),
      classLessonId: parseInt(match[4]),
    };
    // 时间保存为当前时间
    lastUpdateTime = new Date().toISOString();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Data received", data: data }));
  });
}

function getData(req, res) {
  // 返回数据lastUpdateTime和lastData
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      lastUpdateTime: lastUpdateTime,
      lastData: lastData,
    })
  );
}

const server = https.createServer(credentials, (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  if (pathname === "/" && req.method === "GET") getIndex(res);
  else if (pathname === "/newData" && req.method === "POST") newData(req, res);
  else if (pathname === "/getData" && req.method === "GET") getData(req, res);
  else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

const port = 443;
server.listen(port, () => {
  console.log(`HTTPS Server running on port ${port}`);
});
