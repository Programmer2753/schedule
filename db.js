import mysql from 'mysql2/promise';

// Проверка: загрузились ли переменные
if (!process.env.MYSQL_HOST) {
  console.error("КРИТИЧЕСКАЯ ОШИБКА: MYSQL_HOST не определен в Environment Variables!");
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST, // Здесь должно быть что-то вроде sql7.freemysqlhosting.net
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 3, 
  queueLimit: 0,
  // Добавляем защиту от тайм-аутов
  connectTimeout: 10000 
});

export default pool;