# API doc

- Path: `/api/docs`

## Weather API design choices

### 需求：上次提到的 weather API 修改

- 目前 weather API 設計是每次都提供完整的六邊形的位置資訊，包含每個六邊形的七個點：

```json
{
  "rainGrid": {
    "computedAt": "2024-12-09T08:54:29.708Z",
    "grid": {
      "featureCollection": [
        {
          "type": "Feature",
          "properties": {
            "ploygonId": 0,
            "averageRainDegree": 3
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [[121.5667, 24.9914]] // 然後是六邊形的六個點資訊
            ]
          }
        }
      ]
    }
  }
}
```

- 但上次有說可以避免每次都傳六邊形的(靜態)位置資訊

### 作法 A: 後端在 wether API 提供產生六邊形所需的資訊

因為生成六邊形 `turf.hexGrid` 需要 bbox, cellSide, unit：

```js
var bbox = [
  121.45703400595465, 24.960612141045967, 121.66498889301366, 25.2095095097064,
];
var cellSide = 0.5;
var options = { units: "kilometers" };

var hexgrid = turf.hexGrid(bbox, cellSide, options);
```

因此 API response 帶入 hexGrid 所需資訊，和每個六邊形的屬性（polygonId 對應到的 properties）：

```json
{
  "rainGrid": {
    "computedAt": "2024-12-09T08:54:29.708Z",
    // 生成 hexgrid 的所需資訊
    "hexGrid": {
      "bbox": [
        121.45703400595465, 24.960612141045967, 121.66498889301366,
        25.2095095097064
      ],
      "cellSide": 0.5,
      "options": { "units": "kilometers" }
    },
    // 一個 array, index 就是 polygonId, values 是 該 polygon 的 properties
    "polygonIdToProperties": [
      { "averageRainDegree": 3 },
      { "averageRainDegree": 3.1 }
      // ...
    ]
  }
}
```

### 作法 B: 後端另外提供 polygon featureCollection 的 API 端點

- 多個靜態的 API `/polygons`，放六邊形的 featureCollection

```json
// API: /polygons
{
"featureCollection": [
        {
          "type": "Feature",
          "properties": {
            "ploygonId": 0,
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  121.5667,
                  24.9914
                ]
              ] // 然後是六邊形的六個點資訊
            ]
          }
        } //....
}
```

- 原本的天氣 API `/weather` 只放每個 polygonId 的資訊

```json
{
  "rainGrid": {
    "computedAt": "2024-12-09T08:54:29.708Z",
    // 一個 array, index 就是 polygonId, values 是 該 polygon 的 properties
    "polygonIdToProperties": [
      { "averageRainDegree": 3 },
      { "averageRainDegree": 3.1 }
      // ...
    ]
  }
}
```

|              | **作法 A**                                                   | **作法 B**                                                                     |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Frontend     | 需重新產生 hexGrid，多計算開銷<br>-留意前後端 hexGrid 一致性 | 無需重新產生 hexGrid                                                           |
| Request 數量 | 只要一次                                                     | 要打兩次<br>-但 polygons 的靜態資訊也許可以做優化（開很久的 cache 之類的）<br> |
