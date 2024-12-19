/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/reports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get the basic information about records based on location
     * @description Get the basic information about records based on location
     */
    get: {
      parameters: {
        query: {
          /** @description 緯度 */
          lng: components['parameters']['LngParam'];
          /** @description 經度 */
          lat: components['parameters']['LatParam'];
          /** @description Radius in meter */
          radius: components['parameters']['RadiusParam'];
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description successful operation */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ReportList'];
          };
        };
        400: components['responses']['BadRequestError'];
      };
    };
    put?: never;
    /**
     * Add a new weather report
     * @description Add a new weather report
     *      - 在 header 帶入 Jwt token 用來辨識 user
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json:': components['schemas']['ReportBase'];
        };
      };
      responses: {
        /** @description report created successfully */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ReportResponse'];
          };
        };
        400: components['responses']['BadRequestError'];
        401: components['responses']['UnauthorizedError'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/report/{reportId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get the detail information about a report
     * @description 取得某個 report 的詳細資料
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description ID of the report */
          reportId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description successful operation */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ReportResponse'];
          };
        };
        404: components['responses']['NotFoundError'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/weather': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get nearby weather data
     * @description Get nearby weather data
     *
     *     - 參考 google place API 的 search nearby，用經緯度與 radius 查詢
     *
     *     回傳值：
     *     - rainGrid (雨量內插後圖層)
     */
    get: {
      parameters: {
        query: {
          /** @description 緯度 */
          lng: components['parameters']['LngParam'];
          /** @description 經度 */
          lat: components['parameters']['LatParam'];
          /** @description Radius in meter */
          radius: components['parameters']['RadiusParam'];
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description successful operation */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Weather'];
          };
        };
        400: components['responses']['BadRequestError'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/users/{userId}/subscriptions': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the user */
        userId: string;
      };
      cookie?: never;
    };
    /**
     * List a user’s subscriptions
     * @description List all subscriptions of a user
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description ID of the user */
          userId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description successful operation */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SubscriptionResponse'][];
          };
        };
      };
    };
    put?: never;
    /**
     * Create a new subscription
     * @description - recurrence 參考 [google calendar API](https://developers.google.com/calendar/api/concepts/events-calendars#recurring_events)
     *       - 能設定頻率 freq（每週、每日）、星期幾 BYDAY 等等
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description ID of the user */
          userId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json:': components['schemas']['SubscriptionBase'];
        };
      };
      responses: {
        /** @description subscription created successfully */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SubscriptionResponse'];
          };
        };
        400: components['responses']['BadRequestError'];
        401: components['responses']['UnauthorizedError'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/users/{userId}/subscriptions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the user */
        userId: string;
        /** @description ID of the subscriptions */
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete a subscription */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description ID of the user */
          userId: string;
          /** @description ID of the subscriptions */
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description successful operation */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        404: components['responses']['NotFoundError'];
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/signup': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Signup a native user account
     * @description Signup a native user account
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json:': {
            /** @example user-name */
            name: string;
            /** @example hello@gmail.com */
            email: string;
            /** @example password */
            password: string;
          };
        };
      };
      responses: {
        /** @description successful operation */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              /** @example a-jwt-token */
              accessToken: string;
              user: components['schemas']['UserBase'];
            };
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Login a native user account
     * @description Login a native user account
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json:': {
            /** @example null */
            email: string;
            /** @example password */
            password: string;
          };
        };
      };
      responses: {
        /** @description successful operation */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              /** @example a-jwt-token */
              accessToken: string;
              user: components['schemas']['UserBase'];
            };
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/callback/google': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Google OAuth callback url
     * @description Google OAuth callback url
     */
    get: {
      parameters: {
        query?: {
          /** @description Authorization code from Google */
          code?: string;
          /** @description State parameter for CSRF protection */
          state?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description successful operation */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              /** @example a-jwt-token */
              accessToken: string;
              user: components['schemas']['UserBase'];
            };
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /**
     * Format: float
     * @description 雨量大小
     * @example 3
     */
    Rain: number;
    /**
     * Format: float
     * @example 20.2
     */
    Temperature: number;
    LatLng: {
      /**
       * Format: double
       * @example 25.018573218641993
       */
      lat: number;
      /**
       * Format: double
       * @example 121.58689498901369
       */
      lng: number;
    };
    Location: {
      latlng: components['schemas']['LatLng'];
      /** @example 台北市文山區木柵路三段100號 */
      address: string;
    };
    ReportBase: {
      location: components['schemas']['Location'];
      rainDegree: components['schemas']['Rain'];
      /** @example path/to/s3/bucket/photo.jpg */
      photoUrl: string;
      /** @example 超大暴雨 */
      comment: string;
    };
    /** @description 加上系統產生資訊的完整 Report */
    ReportResponse: components['schemas']['ReportBase'] & {
      reporterId?: number;
      /** @example tim */
      reporterName?: string;
      /** Format: date-time */
      reportedAt?: string;
    };
    RainGrid: {
      /**
       * Format: date-time
       * @description 此雨量資料更新時間（後端抓取時間）
       */
      updatedAt: string;
      hexGrid: components['schemas']['HexGrid'];
      polyginIdToPreperties: components['schemas']['PolygonIdToPropertiesMap'];
    };
    ReportList: {
      /** @description report Id */
      id: unknown;
      rain: components['schemas']['Rain'];
      latlng: components['schemas']['LatLng'];
    }[];
    Weather: {
      rainGrid: components['schemas']['RainGrid'];
    };
    SubscriptionBase: {
      location: components['schemas']['Location'];
      /**
       * Format: integer
       * @example 7
       */
      selectedPolygonsCount: number;
      /**
       * @description User 自行輸入的通知地點暱稱，通知訊息中使用
       * @example 公司
       */
      nickname: string;
      subEvents: components['schemas']['SubEvent'][];
    };
    SubEvent: components['schemas']['TimeCondition'] &
      components['schemas']['WeatherCondition'] & {
        /** @description 使用者可以決定是否要打開這個訂閱事件 */
        isActive?: boolean;
      };
    /** @description 加上系統產生資訊的完整 Report */
    SubscriptionResponse: components['schemas']['SubscriptionBase'] & {
      id?: number;
      /** Format: date-time */
      createdAt?: string;
    };
    TimeCondition: {
      time?: {
        /**
         * @description 指定時間(fixed)或時間範圍(peroid)或任何時間(anyTime)
         * @enum {string}
         */
        type: 'fixedTimeSummary' | 'anyTimeReport' | 'periodReport';
        /** Format: date-time */
        startTime: string;
        /**
         * Format: date-time
         * @description 如果是指定時間，則不用填寫 endTime
         */
        endTime: string;
        /** @example RRULE:FREQ=DAILY */
        recurrence: string[];
      };
    };
    RainCondition: {
      rain: {
        /**
         * @description gte:大於等於, lte:小於等於, eq:等於
         * @enum {string}
         */
        operator: 'gte' | 'lte' | 'eq';
        value: number;
      };
    };
    WeatherCondition: components['schemas']['RainCondition'];
    UserBase: {
      /** @example 123456 */
      id: number;
      /** @example user-name */
      name: string;
      /** @example user@gmail.com */
      email: string;
      /** @enum {string} */
      provider: 'native' | 'google';
      /** @example https://path/to/avatar.jpg */
      avatar: string;
    };
    HexGrid: {
      /** @description The bounding box of the hex grid. */
      bbox: number[];
      /** @example 0.5 */
      cellSide: number;
      options: {
        /** @example kilometers */
        units: string;
      };
    };
    PolygonProperties: {
      /**
       * Format: float
       * @description Average rain degree for the specific polygon
       * @example 3
       */
      averageRainDegree: number;
    };
    /**
     * @description A mapping of polygon IDs to their corresponding properties
     * @example {
     *       "1": {
     *         "averageRainDegree": 3
     *       },
     *       "2": {
     *         "averageRainDegree": 3.1
     *       }
     *     }
     */
    PolygonIdToPropertiesMap: {
      [key: string]: components['schemas']['PolygonProperties'];
    };
    Feature: {
      /** @enum {string} */
      type: 'Feature';
      properties: {
        /** @description 這個 feature(polygon) 的 id */
        ploygonId: number;
        averageRainDegree: components['schemas']['Rain'];
      };
      /** @description The geometry of this feature */
      geometry: {
        /** @enum {string} */
        type: 'Polygon';
        /** @description An array of linear rings representing the polygon */
        coordinates: components['schemas']['GeoJsonPosition'][][];
      };
    };
    /**
     * @description GeoJSON 座標點 經度, 緯度
     * @example [
     *       121.5667,
     *       24.9914
     *     ]
     */
    GeoJsonPosition: number[];
    FeatureCollection: {
      featureCollection: components['schemas']['Feature'][];
    };
    ErrorResponse: {
      error: {
        /**
         * @description Error code
         * @example INVALID_INPUT
         */
        code: string;
        /**
         * @description Human readable error message
         * @example Invalid input parameters
         */
        message: string;
        /** @description Additional error details */
        details?: Record<string, never>;
      };
    };
  };
  responses: {
    /** @description Invalid input parameters */
    BadRequestError: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description Access token is missing or invalid */
    UnauthorizedError: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description Resource not found */
    NotFoundError: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
  };
  parameters: {
    /** @description 緯度 */
    LngParam: number;
    /** @description 經度 */
    LatParam: number;
    /** @description Radius in meter */
    RadiusParam: number;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
