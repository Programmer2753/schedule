import pool from '../db.js';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  console.log('Register attempt started'); // Лог начала

  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });

  try {
    // Проверка связи с пулом
    if (!pool) throw new Error('Database pool not initialized');

    console.log('Checking user existence for:', email);
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (users.length > 0) return res.status(409).json({ error: 'Пользователь уже существует' });

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Inserting user...');
    await pool.query('INSERT INTO users (email, password, registeredAt) VALUES (?, ?, NOW())', [email, hashedPassword]);
    
    res.status(201).json({ message: 'Пользователь зарегистрирован' });

  } catch (error) {
    console.error('CRITICAL ERROR in /api/register:', error); // Эту ошибку ищи в логах Vercel
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}