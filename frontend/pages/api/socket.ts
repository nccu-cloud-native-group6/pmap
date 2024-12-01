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
      const { token, userId } = socket.handshake.auth;

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

      // 檢查用戶 ID 是否匹配
      if (socket.data.user.email !== userId) {
        throw new Error("User ID does not match token");
      }

      // 將用戶加入專屬房間
      socket.join(userId);

      setInterval(() => {
        const notification = {
          id: Date.now(),
          title: "New Message",
          message: `This is a message for ${userId}`,
          time: new Date().toLocaleTimeString(),
        };
        io.to(userId).emit("new-notification", notification); // 推送到該用戶房間
      }, 10000);

      socket.on("disconnect", () => {
        console.log("Socket.IO disconnected:", socket.id);
      });
    });

    console.log("Socket.IO server initialized");
  }

  res.end();
}
