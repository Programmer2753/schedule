import mysql from 'mysql2/promise';

// Логируем попытку подключения (только для отладки)
console.log("Попытка подключения к базе:", process.env.DB_HOST);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5, 
  queueLimit: 0,
  connectTimeout: 30000 
});

// Проверка связи при старте
pool.getConnection()
  .then(conn => {
    console.log("Успешное подключение к БД!");
    conn.release();
  })
  .catch(err => {
    console.error("ОШИБКА ПОДКЛЮЧЕНИЯ К БД:", err.message);
  });

export default pool;