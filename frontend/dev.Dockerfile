# 使用 Node.js 20.4 的 Alpine 基底映像
FROM node:20.4-alpine

# 設定工作目錄
WORKDIR /app

# 安裝依賴的工具 (可選，例如 bash)
RUN apk add --no-cache bash

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝開發依賴
RUN npm install

# 複製應用程式檔案
COPY . .

# 暴露開發伺服器的預設埠
EXPOSE 3001

# 啟動 Next.js 開發伺服器
CMD ["npm", "run", "dev:start"]