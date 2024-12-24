// Entites for process-weather.ts

// Pmap
export interface Location {
  lat: number;
  lng: number;
}

export interface Report {
  rainDegree: number;
  comment: string;
  photoUrl: string;
  userId: number;
  locationId: number;
}

export interface WeatherInfo {
  temperature: number;
  rainfall: number;
  locationId: number;
}

// The weather data from CWA
export interface WeatherData {
  StationName: string; // 測站名稱，例如 "三民"
  StationId: string; // 測站 ID，例如 "C0V700"
  ObsTime: {
    // 觀測時間
    DateTime: string; // ISO 8601 格式的日期時間，例如 "2024-11-25T19:00:00+08:00"
  };
  GeoInfo: {
    // 地理資訊
    Coordinates: Array<{
      CoordinateName: string; // 座標系統名稱，例如 "TWD67"
      CoordinateFormat: string; // 座標格式，例如 "decimal degrees"
      StationLatitude: number; // 測站緯度
      StationLongitude: number; // 測站經度
    }>;
    StationAltitude: string; // 測站高度（公尺）
    CountyName: string; // 所屬縣市名稱，例如 "高雄市"
    TownName: string; // 所屬鄉鎮區名稱，例如 "三民區"
    CountyCode: string; // 縣市代碼
    TownCode: string; // 鄉鎮代碼
  };
  WeatherElement: {
    // 氣象元素
    Weather: string; // 天氣描述，例如 "多雲"
    Now: {
      // 即時天氣數據
      Precipitation: number; // 降水量（毫米）
    };
    WindDirection: number; // 風向（角度）
    WindSpeed: number; // 風速（公尺/秒）
    AirTemperature: number; // 氣溫（攝氏度）
    RelativeHumidity: number; // 相對濕度（百分比）
    AirPressure: number; // 氣壓（百帕）
    GustInfo: {
      // 陣風資訊
      PeakGustSpeed: number; // 峰值陣風速度，-99 表示無效值
      Occurred_at: {
        // 峰值陣風發生時的相關資訊
        WindDirection: number; // 陣風風向，-99 表示無效值
        DateTime: string; // 發生時間，"-99" 表示無效值
      };
    };
    DailyExtreme: {
      // 每日極值資訊
      DailyHigh: {
        // 當日最高溫
        TemperatureInfo: {
          AirTemperature: number; // 最高氣溫（攝氏度）
          Occurred_at: {
            DateTime: string; // 發生時間
          };
        };
      };
      DailyLow: {
        // 當日最低溫
        TemperatureInfo: {
          AirTemperature: number; // 最低氣溫（攝氏度）
          Occurred_at: {
            DateTime: string; // 發生時間
          };
        };
      };
    };
  };
  RainfallElement: {
    Past10Min: {
      Precipitation: number; // 過去 10 分鐘累積雨量（毫米）
    };
    Past1hr: {
      Precipitation: number; // 過去 60 分鐘累積雨量（毫米）
    }
  };
  locationId: number; // attach the locationId from pmap db
}
