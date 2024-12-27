import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios, { AxiosError } from "axios";
import { useUserAvatar } from "../../../composables/useUserAvatar";

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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "hidden" }, // 傳遞 signin 或 signup
      },
      async authorize(credentials) {
        try {
          const { email, password, action } = credentials || {};

          if (!email || !password) {
            throw new Error("Email and password are required.");
          }

          const endpoint =
            action === "signup"
              ? `${process.env.BACKEND_API_URL}/api/auth/signup`
              : `${process.env.BACKEND_API_URL}/api/auth/nativeSignin`;

          const response = await axios.post(endpoint, {
            email,
            password,
            ...(action === "signup" && { name: email.split("@")[0] }),
            ...(action === "signup" && { provider: "native" }),
          });
          const animal = useUserAvatar().getRandomAnimal();
            const user = {
              id: response.data.userId,
              email: email,
              name: `Anonymous ${animal}`,
              image: `https://ssl.gstatic.com/docs/common/profile/${animal}_lg.png`
            }
            return user;

        } catch (error) {
          if (error instanceof Error) {
            const axiosError = error as AxiosError;
            console.error("Error during credentials authorization:", axiosError.response?.data || error.message);
          } else {
            console.error("Error during credentials authorization:", error);
          }
          if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.error || "Unexpected error during authorization.");
          } else {
            throw new Error(error instanceof Error ? error.message : "Unexpected error during authorization.");
          }
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // 使用 JWT
    maxAge: 7 * 24 * 60 * 60, // Token 有效期 7 天
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (user) {
        token = Object.assign({}, token, {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          isSynced: false, // 初次登入或註冊時，未同步
        });
      }

      if (account?.access_token) {
        token.access_token = account.access_token;
      }
      if (account?.provider) {
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (session) {
        session = Object.assign({}, session, { access_token: token.access_token });
        session.user = Object.assign({}, session.user, {
          id: token.id,
          name: token.name,
          email: token.email,
          image: token.image,
          provider: token.provider,
        });
      }

      // 移除後端同步邏輯
      return session;
    },
  },
});
