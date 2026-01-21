import mysql from 'mysql2/promise';

let pool;

try {
  if (!process.env.DB_HOST) {
    throw new Error('DB_HOST environment variable is missing!');
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000 // Увеличим тайм-аут до 20 сек
  });
  
  console.log('Database pool created successfully');
} catch (error) {
  console.error('Database connection configuration error:', error);
}

export default pool;