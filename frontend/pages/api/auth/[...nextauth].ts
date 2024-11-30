import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "",
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt", // 使用 JWT
    maxAge: 7 * 24 * 60 * 60, // Token 有效期 7 天
  },
  callbacks: {
    async jwt({token, account}) {

      if (account) {
        token = Object.assign({}, token, { access_token: account.access_token });
      }
      if (account?.id_token) {
        token = Object.assign({}, token, { access_token: account.id_token });
      }
      return token
    },
    async session({session, token}) {
    if(session) {
      session = Object.assign({}, session, {access_token: token.access_token})
      }
    return session
    }
  }
});
