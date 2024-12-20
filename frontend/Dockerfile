FROM node:20.4-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install --force

ENV NODE_ENV=production

RUN npm run build:prod

# 將 production dependency 安裝在獨立階段避免 devDependencies 進入最終映像
RUN npm prune --production --legacy-peer-deps


FROM node:20.4-alpine AS runner

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
USER nextjs

WORKDIR /app

# 複製建置階段產生的 .next 與 node_modules (只有生產相依性)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./
# COPY --from=builder /app/public ./public
# 如果有其他必要檔案(例如 package.json 用於 runtime、NEXT_PUBLIC_* 環境變數)也一起複製
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]
