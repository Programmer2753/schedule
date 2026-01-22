import mysql from 'mysql2/promise';

// 1. Проверяем наличие переменных (выведется в логи Vercel)
if (!process.env.DB_HOST) {
  console.error("ОШИБКА: Переменная DB_HOST не найдена в окружении!");
}

const pool = mysql.createPool({
  // Используй именно те имена, которые вписаны в Vercel!
  host: process.env.DB_HOST, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  waitForConnections: true,
  // Для бесплатных баз лучше ставить 2-3, 10 — это слишком много, 
  // база будет выкидывать ошибку "too many connections"
  connectionLimit: 3, 
  queueLimit: 0,
  connectTimeout: 20000 
});

// Пробросим небольшую проверку в логи при инициализации
pool.getConnection()
  .then(conn => {
    console.log("Успешное подключение к удаленной БД:", process.env.DB_HOST);
    conn.release();
  })
  .catch(err => {
    console.error("Ошибка подключения к БД в db.js:", err.message);
  });

export default pool;