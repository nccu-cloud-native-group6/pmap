import { Server } from "socket.io";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      const { token, userId, provider } = socket.handshake.auth;

      let user;

      // 驗證 Google Token
      if (provider === "google") {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        user = { email: payload?.email, name: payload?.name };
      }

      // 驗證 GitHub Token
      else if (provider === "github") {
        const response = await axios.get("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { email, name } = response.data;
        user = { email, name };
      } else {
        throw new Error("Unsupported provider");
      }
      console.log("User connected:", user);

      // 檢查用戶 ID 是否匹配
      if (user.email !== userId) {
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
      }, 1000);

      socket.on("disconnect", () => {
        console.log("Socket.IO disconnected:", socket.id);
      });
    });

    console.log("Socket.IO server initialized");
  }

  res.end();
}
