import pool from '../db.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { email, name, avatarColor } = req.body;

  try {
    await pool.query(
      'UPDATE users SET profileName = ?, avatarColor = ? WHERE email = ?',
      [name, avatarColor, email]
    );
    res.status(200).json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}