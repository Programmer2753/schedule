import pool from '../db.js';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });

  const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (users.length > 0) return res.status(409).json({ error: 'Пользователь уже существует' });

  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO users (email, password, registeredAt) VALUES (?, ?, NOW())', [email, hashedPassword]);
  res.status(201).json({ message: 'Пользователь зарегистрирован' });
}