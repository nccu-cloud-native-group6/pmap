# 後端目前架構

Application Layer - Infrastructure Layer - Database Layer - Controller - Router

### Application Layer
Handler -> 處理商業邏輯處，以及使用封裝好的 Service 處理所需 DB 互動，彙整後轉換成 Response 回傳給 Controller

### Infrastructure Layer

分成兩層封裝資料庫 Query

- Repository -> 單一 Query，撰寫 raw SQL 的地方 ex: findById
- Service -> 透過使用一到多個 Repository 去完成當前 api 商業邏輯所需要與資料庫互動的動作，資料庫可能 file server, db...

### Database Layer

各種資料庫、Entity、Client 的初始化 ex: db, file server, redis...

### Controller

檢查 req 參數正確性，轉交給 Handler 處理後回傳給 Client

### Router

94 api路由



## 其他
- Errors: 集中一個 file 管理所有的 error ex: 400, 404, 500...
- Middlewares: jwt, errorHandler
- Types: 定義全域不變的常用 type 型別、express request 型別（之後還需補上 multer
- Utils: 常用、獨立的函數



## env 管理

本地分成兩個 env ，分別給 docker compose file 跟後端應用用
- /pmap/.env.dev
        - 這一份 only 給 docker compose file 使用
- /pmap/backend/src/.env.dev
        - 這一份 only 給後端應用用
        - 後端容器也是吃這個份 env，當後端有新的 env 時就在這裡更新



## 本地 / 生產環境隔離

### 本地開發流程

就進到 backend 目錄下，執行 npm run dev 即可，執行後會根據 docker-compose-dev.yml 啟動本地開發所需的服務容器
- 當 npm run dev 測試時，如果有更新程式碼，不需要重新下一次指令，容器會自動更新方便測試
- npm run dev 會先根據 backend/src/Database/migrate/schema.sql 初始化資料表

### 生產環境

專案資料夾位於 /srv 下，nginx 設定檔位於 /srv/nginx。

啟動指令：
```
docker compose -f /srv/pmap/docker-compose.yml --env-file .env.production up -d --build
```




