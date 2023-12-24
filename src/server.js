import http from "http";
import express from "express"; // HTTP 프로토콜 express 사용.
import SocketIO from "socket.io";
//import Websocket from "ws";
//import { instrument } from "@socket.io/admin-ui";
//import { Server } from "socket.io";

const app = express();
// 셋업
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public")); // 유저에게 보여줄 url 생성
// Get 요청
app.get("/", (req, res) => res.render("home")); // Route handler to home.pug
app.get("/*", (req, res) => res.redirect("/")); // 유저 이상한 url 입력시 홈으로 돌려보내기

const server = http.createServer(app);
const io = SocketIO(server);

io.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () => console.log("Listening on http://localhost:3000");
server.listen(3000, handleListen);
