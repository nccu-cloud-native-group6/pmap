# API doc

- Path: `/api/docs`

## API 設計與討論紀錄

### Weather API redesign:

- 目標：減少傳送過於冗長的靜態（幾乎不會改變的）資訊
- 討論: [PR #10](https://github.com/nccu-cloud-native-group6/pmap/pull/10)
- 結論：採用作法 A
  - > 雖然說多計算開銷但以台北市來說影響不是到太大
