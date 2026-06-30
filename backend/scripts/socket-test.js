// socket-test.js
const { io } = require("socket.io-client");

const socket = io("http://[::1]:8080", { transports: ["websocket"] });

socket.on("connect", () => {
  console.log("✅ Connected to socket.io, id:", socket.id);
});

socket.on("newEpisode", (data) => {
  console.log("🔔 Received newEpisode event:");
  console.dir(data, { depth: null });
});

socket.on("disconnect", () => console.log("📴 Disconnected"));
socket.on("connect_error", (err) => console.error("❌ Connect error:", err));
