# 雲原生 - planning 01 討論紀錄

## 專案題目：天氣回報平台

### 畫面

Wireframe
- https://www.figma.com/design/GZ2jluml1SlbE2jwcGaVY9/This-is-not-Pmap?node-id=227-10858&t=x7Fsl0hr8KWxWxXq-1

## 核心功能

- 使用者可以查詢更細節、更即時地降雨天氣資訊
    - 以氣象局資料 + 群眾回報所計算的更即時、更準確地雨量觀測圖
        - 把每個回報的點都當成一個測站，耨過內插，計算出一個雨量地圖
- 回報天氣狀況：
    - 使用者每次打開 APP 時回報
    - 所回報資訊
        - 提供雨量大小
        - 留言、照片（皆為 optional）
    - 此回報資訊可於地圖上檢視（像個測站）
- 訂閱天氣
    - 使用者可訂閱某個地點的統計天氣狀態或是回報訊息
        - 訂閱條件（之後再確定，但可能選項如下）：
            - 固定時間，到了就通知
            - 時間區段（有新回報就通知）
            - 雨量變化，例如雨量變小


#### Notes
- 原先討論的「提問」被視為一次性訂閱
    - e.g. 提問公館天氣狀況 -> 等公館附近的人回報 -> 收到通知
- 訂閱的通知可能收到兩種回覆：
    1. 統計出的天氣資訊
    2. 某個/多個回報的貼文資訊
- 開發功能優先順序：
    1. 回報機制與地圖呈現
    2. 訂閱

### 架構圖

#### overview 架構圖
- https://drive.google.com/file/d/1Dl2NspEq9401AUm3Ivdg21KYSIwlNsx-/view


#### 靜態架構圖

- https://drive.google.com/file/d/1L0dBxuBubDMXpkisVsSzKRG7ggjwDlEh/view

## 技術
### 後端

程式語言 & 版本
- typescript
- ES6
- node.js
    - 版本: 20 (LTS)

框架
- Exrpess

排程器
- 待研究
- cronjob / event bridge / lambda

Message queue
- 待研究
-  [nats](https://nats.io/)...

資料庫
- 待研究（No-SQL or Relational）
      
### 前端
- Next.js
- Leaflet

## 團隊合作

### Branching Model

Trunk-based devlopment

- 少了 Git Flow 中 long-lived 的 develop branch，只要 merge 一次就好
    - 加上之前沒用過，想嘗試看看

**其他**
- 發 PR 很麻煩 -> 這個可以再想想發 PR 很麻煩是為什麼，有沒有什麼減輕的方式


### Trello
- Trello: https://trello.com/b/iwRgceLf/cloud-native-group6
- 除了 TODO, Doing, Done，參考組員經驗多加一個 Review

### 固定開會時間
- 週五 1500

### 這次討論遇到的問題

- 原先的專案主題（找廁所）不確定是否合適？
    - 直接詢問老師，經過老師的 review 與分享後，我們又發想了更多潛在功能與可能有高流量的情境。技術選型通常不能只是單純想用就用，例如原本的找廁所想用 k8s 就被老師提醒 k8s 成本不便宜，以這個情境也不需要到 k8s
- 我們的系統如何應對 or 知道使用者亂回報？
    - 由於很難驗證在回報當下就判斷出是亂回報，因此一種方法可能是人工審核，例如：當一個新回報與附近回報的差異度太大時，可以先將這個回報標記起來，再放到某個供人工審核的地方。

### 完整討論紀錄（包含舊題目）
- https://hackmd.io/@AzXomSBFRHqKpk9SGRehNg/Hk_Bzno0R
