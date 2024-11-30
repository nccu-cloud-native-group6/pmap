import { Server } from "socket.io";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const clients: Record<string, number> = {}; // 紀錄每個客戶端的心跳時間

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    res.socket.server.io = io;

    io.on("connection", async (socket) => {
      const token = socket.handshake.auth.token;

      try {
        // 驗證 Google idToken
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        socket.data.user = payload;
        console.log("Authenticated user:", payload);
      } catch (err) {
        console.error("JWT validation failed:", err);
        socket.disconnect();
        return;
      }

      // 測試事件處理
      socket.on("test-event", (data) => {
        console.log("Received test-event:", data);
        const responseEvent = `test-response-${data.userId}`;
        socket.emit(responseEvent, { message: "Hello, client!" });
      });

      socket.on("heartbeat", (data) => {
        console.log(`Heartbeat received from ${socket.id}`, data);
        clients[socket.id] = Date.now(); // 更新心跳時間
        socket.emit("heartbeat-response", { status: "alive", timestamp: Date.now() });
      });

      

      socket.on("disconnect", () => {
        console.log("Socket.IO disconnected:", socket.id);
      });
    });

    console.log("Socket.IO server initialized");
  }

  res.end();
}
