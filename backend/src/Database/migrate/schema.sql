-- schema.sql

-- 禁用外鍵檢查
SET FOREIGN_KEY_CHECKS=0;

-- ------------------------------------------------------
-- Drop tables in the correct order to avoid foreign key conflicts
-- ------------------------------------------------------

DROP TABLE IF EXISTS `WeatherInfo`;
DROP TABLE IF EXISTS `SubEvents`;
DROP TABLE IF EXISTS `Reports`;
DROP TABLE IF EXISTS `Polygons`;
DROP TABLE IF EXISTS `Subscriptions`;
DROP TABLE IF EXISTS `Locations`;
DROP TABLE IF EXISTS `Users`;

-- 啟用外鍵檢查
SET FOREIGN_KEY_CHECKS=1;

-- ------------------------------------------------------
-- Table structure for table `Users`
-- ------------------------------------------------------

CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `provider` enum('native','google','github') DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table structure for table `Polygons`
-- ------------------------------------------------------

CREATE TABLE `Polygons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `avgRainDegree` float DEFAULT NULL,
  `area` polygon,
  `centerLat` double,
  `centerLng` double,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ------------------------------------------------------
-- Table structure for table `Locations`
-- ------------------------------------------------------

CREATE TABLE `Locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `polygonId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  
  -- 新增的空間欄位，存儲地理位置
  `location_point` POINT NOT NULL GENERATED ALWAYS AS (
    ST_GeomFromText(CONCAT('POINT(', lng, ' ', lat, ')'), 4326)
  ) STORED,
  
  PRIMARY KEY (`id`),
  KEY `polygonId` (`polygonId`),
  
  -- 建立空間索引
  SPATIAL INDEX `idx_location_point` (`location_point`),
  
  CONSTRAINT `Locations_ibfk_1` FOREIGN KEY (`polygonId`) REFERENCES `Polygons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table structure for table `Subscriptions`
-- ------------------------------------------------------

CREATE TABLE `Subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nickName` varchar(255) DEFAULT NULL,
  `rainDegree` int DEFAULT NULL,
  `operator` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `locationId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `locationId` (`locationId`),
  CONSTRAINT `Subscriptions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`),
  CONSTRAINT `Subscriptions_ibfk_2` FOREIGN KEY (`locationId`) REFERENCES `Locations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table structure for table `Reports`
-- ------------------------------------------------------

CREATE TABLE `Reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rainDegree` int NOT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `photoUrl` varchar(255) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `locationId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `locationId` (`locationId`),
  CONSTRAINT `Reports_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`),
  CONSTRAINT `Reports_ibfk_2` FOREIGN KEY (`locationId`) REFERENCES `Locations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table structure for table `SubEvents`
-- ------------------------------------------------------

CREATE TABLE `SubEvents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eventType` enum('fixedTimeSummary','anyTimeReport','periodReport') NOT NULL,
  `startTime` time DEFAULT NULL,
  `startDate` timestamp NULL DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `recurrence` varchar(255) NOT NULL,
  `lastNotifiedAt` timestamp NULL DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `subscriptionId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscriptionId` (`subscriptionId`),
  CONSTRAINT `SubEvents_ibfk_1` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscriptions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table structure for table `WeatherInfo`
-- ------------------------------------------------------

CREATE TABLE `WeatherInfo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `temperature` int DEFAULT NULL,
  `rainfall` float DEFAULT NULL,
  `locationId` int DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `locationId` (`locationId`),
  CONSTRAINT `WeatherInfo_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `Locations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
