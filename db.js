import mysql from 'mysql2/promise';

if (!process.env.DB_HOST) {
  console.error("ОШИБКА: Нет переменных окружения для БД");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  // ВАЖНО: Ставим 1. Это медленнее, но надежнее для бесплатных баз.
  connectionLimit: 1, 
  queueLimit: 0,
  connectTimeout: 30000 // Даем 30 сек на подключение
});

export default pool;