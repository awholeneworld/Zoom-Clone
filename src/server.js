import http from "http";
import express from "express"; // HTTP 프로토콜 express 사용.
import Websocket from "ws";

const app = express();

// 셋업
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public")); // 유저에게 보여줄 url 생성

// Get 요청
app.get("/", (req, res) => res.render("home")); // Route handler to home.pug
app.get("/*", (req, res) => res.redirect("/")); // 유저 이상한 url 입력시 홈으로 돌려보내기

const handleListen = () => console.log("Listening on http://localhost:3000");
//app.listen(3000, handleListen);

const server = http.createServer(app);

const wss = new Websocket.Server({ server }); // 인자로 넣어서 http 서버도 작동시키기

/*
function handleConnection(socket) {
    console.log(socket);
}
wss.on("connection", handleConnection);
*/
// same thing is the following
wss.on("connection", (socket) => {
  console.log("Connection occurred from the Browser");
  socket.on("close", () =>
    console.log("Disconnection ocurred from the Browser")
  );
  socket.on("message", (message) => {
    console.log(message.toString("utf-8"));
  });
  socket.send("hello!! I'm the Server");
});

server.listen(3000, handleListen);
