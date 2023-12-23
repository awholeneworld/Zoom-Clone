import http from "http";
import express from "express"; // HTTP 프로토콜 express 사용.
import Websocket from "ws";
//import SocketIO from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { Server } from "socket.io";

const app = express();
// 셋업
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public")); // 유저에게 보여줄 url 생성
// Get 요청
app.get("/", (req, res) => res.render("home")); // Route handler to home.pug
app.get("/*", (req, res) => res.redirect("/")); // 유저 이상한 url 입력시 홈으로 돌려보내기

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(io, {
  auth: false,
});
//const wss = new Websocket.Server({ server }); // 인자로 넣어서 http 서버도 작동시키기
//const sockets = [];

const handleListen = () => console.log("Listening on http://localhost:3000");
//app.listen(3000, handleListen);

/*
function handleConnection(socket) {
    console.log(socket);
}
wss.on("connection", handleConnection);
*/
// same thing is the following
/*
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("Connection occurred from the Browser");
  socket.on("close", () =>
    console.log("Disconnection ocurred from the Browser")
  );
  socket.on("message", (message, isBinary) => {
    const parsed = JSON.parse(message);
    console.log(parsed);
    switch (parsed.type) {
      case "nickname":
        socket["nickname"] = parsed.payload;
        break;
      case "new_message":
        for (let i = 0; i < sockets.length; i++) {
          console.log(sockets[i].nickname);
          if (sockets[i] != socket)
            sockets[i].send(`${socket.nickname}: ${parsed.payload}`);
        }
        break;
    }
    // sockets.forEach((aSocket) => aSocket.send(message, { binary: isBinary }));
  });
});
*/

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms }, // const sids/rooms = io.sockets.adapter.sids/rooms;
    },
  } = io;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRooms(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, func) => {
    socket.join(roomName);
    func();
    socket.to(roomName).emit("welcome", socket.nickname, countRooms(roomName));
    io.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRooms(room) - 1)
    );
  });
  socket.on("disconnet", () => {
    io.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, func) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    func();
  });
  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });
});
server.listen(3000, handleListen);
