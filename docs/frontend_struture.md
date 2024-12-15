# 前端專案說明

此專案是基於 **Next.js 15** 的前端應用，使用 **TypeScript** 作為開發語言，並整合了 **NextAuth.js**、**Leaflet 地圖**、以及 **TailwindCSS** 等技術實現的應用程式。

## 目錄結構

```plaintext
.
├── Dockerfile              # 生產環境的 Docker 構建文件
├── dev.Dockerfile          # 開發環境的 Docker 構建文件
├── app                     # App 目錄，使用 Next.js 的 App Router
│   ├── layout.tsx          # 全局佈局設定
│   ├── page.tsx            # 主頁
│   └── providers.tsx       # 全局的 Context Providers
├── components              # 通用元件
│   ├── login               # 登錄元件
│   │   └── index.tsx       # 登錄功能實現
│   ├── map                 # 地圖元件
│   │   ├── index.tsx       # 地圖容器
│   │   └── map.tsx         # 地圖邏輯
│   └── notification        # 通知元件
│       ├── index.tsx       # 通知容器
│       └── notificationIcon.tsx # 通知圖標
├── pages                   # 使用 Next.js Page Router
│   ├── _app.tsx            # 全局應用邏輯
│   └── api
│       └── auth
│           └── [...nextauth].ts # NextAuth.js 的 OAuth 配置
├── styles                  # 全局樣式
│   └── globals.css         # 全局 CSS
├── types                   # 全局型別定義
│   └── index.d.ts          # 型別定義主檔案
├── tailwind.config.js      # TailwindCSS 配置文件
├── tsconfig.json           # TypeScript 配置文件
├── package.json            # 專案依賴與指令配置
└── next.config.js          # Next.js 配置文件
```

## 本地 / 生產環境隔離

### 本地開發流程

就進到 frontend 目錄下，執行 npm run dev 即可，執行後會根據 docker-compose-dev.yml 啟動本地開發所需的服務容器

- 當 npm run dev 測試時，如果有更新程式碼，不需要重新下一次指令，容器會自動更新方便測試
- 目前前端放在`3000`後端放在`3001`

## 生產環境

尚未建立
