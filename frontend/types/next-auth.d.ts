// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string; // 新增 provider 屬性
    };
    access_token?: string; // 新增 access_token 屬性
  }

  interface User {
    provider?: string; // 用戶 provider 的類型擴展
  }
}
