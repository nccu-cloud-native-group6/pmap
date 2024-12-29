FROM node:20.4-alpine AS builder

WORKDIR /app

COPY . .

# 安裝依賴
RUN npm install --force

# 設定構建階段環境變數
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ENV NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}

ARG NEXT_PUBLIC_BACKEND_API_URL
ENV NEXT_PUBLIC_BACKEND_API_URL=${NEXT_PUBLIC_BACKEND_API_URL}

ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}

# 設定生產環境
ENV NODE_ENV=production

# 構建應用
RUN npm run build:prod

# 移除 devDependencies
RUN npm prune --production --legacy-peer-deps


FROM node:20.4-alpine AS runner

# 創建非 root 使用者
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
USER nextjs

WORKDIR /app

# 複製必要的文件
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

# 設定運行時環境變數
ENV NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}
ENV NEXT_PUBLIC_BACKEND_API_URL=${NEXT_PUBLIC_BACKEND_API_URL}
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
ENV NODE_ENV=production

# 開放應用埠
EXPOSE 3001

# 啟動應用
CMD ["npm", "start"]