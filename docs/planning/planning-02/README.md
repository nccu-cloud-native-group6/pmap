# 雲原生 - planning 02 討論紀錄

## API

API doc: [backend/docs/swagger.yaml](../../../backend/docs/swagger.yaml)，也放在後端的 `api/docs/` endpoint

根據上次 planning 的[架構圖](https://drive.google.com/file/d/1Dl2NspEq9401AUm3Ivdg21KYSIwlNsx-/view) 的脈絡，將 API 大致分為 Weather（有關天氣的資訊）, Reports（使用者的回報）, Supbscriptions（訂閱與通知）, Auth（使用者帳號相關）

目前的主要設計考量 & 討論結果：

- 天氣 API：
  - 參考 google place API 的 search nearby，用經緯度與 radius 查詢，回傳該範圍內的系統所算出的天氣狀態（包含 geojson 中的 feature collection，前端可以直接用來畫圖）
- 訂閱 API:
  - 討論了系統所支援的訂閱類型：
    - fixedTimeSummary（使用者想定時收到天氣資訊）
    - anyTimeReport（使用者想立刻收到回報通知）
    - periodReport（使用者想收到一段時間的回報通知）
  - 討論使用者關注的地點內，多遠之內的回報要收到：
    - 在前端呈現六邊形分割的地圖，當使用者在設定通知時，可選擇關注多大的範圍（以六邊型數量選取）
  - 重複時間的功能參考線上行事曆（google map）的 [rrule](https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html)

## Schema

[DB diagram](https://dbdiagram.io/d/671f950397a66db9a3851ad9)

- 使用 SQL，一方面是考量團隊成員對 SQL 比較熟悉，另一方面是 entity 有蠻多一對多的關係
