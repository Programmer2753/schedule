import pool from '../db.js';

import bcrypt from 'bcrypt';



export default async function handler(req, res) {

  if (req.method !== 'POST') return res.status(405).end();



  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });



  const [users] = await pool.query('SELECT id, password FROM users WHERE email = ?', [email]);

  if (users.length === 0) return res.status(401).json({ error: 'Неверные данные' });



  const user = users[0];

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(401).json({ error: 'Неверные данные' });



  res.status(200).json({ message: 'Вход успешен', userId: user.id });

}