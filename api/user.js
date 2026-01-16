import pool from '../db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const [users] = await pool.query('SELECT id, email, profileName, avatarColor, registeredAt FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = users[0];
    
    // Формируем ответ, похожий на структуру, которую ждет твой фронтенд
    res.status(200).json({
      userId: user.id,
      email: user.email,
      registeredAt: user.registeredAt,
      profile: {
        name: user.profileName,
        avatarColor: user.avatarColor
      },
      // Задачи лучше грузить отдельным запросом (loadUserTasks), но если очень надо, можно и тут через JOIN
      tasks: [] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}