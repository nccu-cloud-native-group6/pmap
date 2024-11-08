import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// dotenv.config();
console.log(process.env.MYSQL_HOST);

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : undefined,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

export default pool;
