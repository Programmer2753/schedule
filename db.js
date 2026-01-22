import mysql from 'mysql2/promise';

// Создаем пул соединений с лимитом
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  // Установи лимит 2 или 3, если у тебя бесплатная база (типа db4free или аналоги)
  connectionLimit: 3, 
  queueLimit: 0
});

export default pool;