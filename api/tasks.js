import pool from '../db.js';

export default async function handler(req, res) {
  const { method } = req;

  // GET: Получить задачи
  if (method === 'GET') {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
      const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (users.length === 0) return res.json({ tasks: [] });

      const userId = users[0].id;
      // ВАЖНО: Выбираем поля так, как ждет твой фронтенд (name вместо title)
      const [tasks] = await pool.query('SELECT id, title as name, description, status, priority, type, date, createdAt FROM tasks WHERE user_id = ?', [userId]);
      
      return res.status(200).json({ tasks });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST: Создать задачу
  if (method === 'POST') {
    const { userId, title, description, status, priority, type, date } = req.body;
    try {
      const [result] = await pool.query(
        'INSERT INTO tasks (user_id, title, description, status, priority, type, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [userId, title, description || '', status, priority || 'none', type || 'task', date || null]
      );
      return res.status(201).json({ message: 'Task created', id: result.insertId });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PUT: Обновить задачу (Rename, Status, Priority, Type, Date)
  if (method === 'PUT') {
    const { id, ...changes } = req.body;
    
    // Маппинг полей фронтенда на поля БД
    const dbFields = {};
    if (changes.name) dbFields.title = changes.name;
    if (changes.description) dbFields.description = changes.description;
    if (changes.status) dbFields.status = changes.status;
    if (changes.priority) dbFields.priority = changes.priority;
    if (changes.type) dbFields.type = changes.type;
    if (changes.date !== undefined) dbFields.date = changes.date; // Важно проверить undefined, т.к. дата может быть null

    if (Object.keys(dbFields).length === 0) return res.status(400).json({ message: 'No changes provided' });

    try {
      // Генерируем динамический SQL запрос
      const setClause = Object.keys(dbFields).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(dbFields), id];

      await pool.query(`UPDATE tasks SET ${setClause} WHERE id = ?`, values);
      return res.status(200).json({ message: 'Task updated' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE: Удалить задачу
  if (method === 'DELETE') {
    const { id } = req.query;
    try {
      await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
      return res.status(200).json({ message: 'Task deleted' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}