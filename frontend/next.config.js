/** @type {import('next').NextConfig} */
module.exports = {
    async rewrites() {
      return [
        {
          source: "/socket.io/:path*", // 客戶端請求 `/socket.io`
          destination: "/api/socket/:path*", // 重寫到 API
        },
        {
          source: "/auth/:path*",
          destination: "/api/auth/:path*",
        },
        
      ];
    },
  };
  