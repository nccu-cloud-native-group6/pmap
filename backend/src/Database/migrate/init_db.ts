import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import logger from '../../Logger/index.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDatabase = async () => {
  const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } =
    process.env;

  if (
    !MYSQL_HOST ||
    !MYSQL_PORT ||
    !MYSQL_USER ||
    !MYSQL_PASSWORD ||
    !MYSQL_DATABASE
  ) {
    console.error('缺少必要的環境變數。請檢查 .env 文件。');
    process.exit(1);
  }

  try {
    // 建立資料庫連接
    const connection = await mysql.createConnection({
      host: MYSQL_HOST,
      port: Number(MYSQL_PORT),
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      multipleStatements: true,
    });

    logger.info('成功連接到 MySQL 資料庫。');

    // 讀取 schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // 執行 SQL 語句
    await connection.query(schema);

    logger.info('資料庫初始化完成。');

    await connection.end();
  } catch (error) {
    logger.error(error, '資料庫初始化失敗：');
    process.exit(1);
  }
};

initDatabase();
