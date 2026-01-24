import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  // Для бесплатной БД в Serverless среде ставим МИНИМУМ
  connectionLimit: 1, 
  queueLimit: 0,
  connectTimeout: 10000 
});

export default pool;