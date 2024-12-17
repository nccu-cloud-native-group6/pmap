# 使用 Node.js 20.4 的 Alpine 基底映像
FROM node:20.4-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝僅生產環境需要的依賴
RUN npm install --production

# 複製應用程式檔案
COPY . .

# 編譯 Next.js 應用程式
RUN npm run build

# 暴露正式伺服器埠
EXPOSE 3000

# 啟動 Next.js 正式伺服器
CMD ["npm", "run", "start"]
