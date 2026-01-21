import pool from '../db.js';

export default async function handler(req, res) {
  const { method } = req;
  console.log(`API Tasks called with method: ${method}`);

  // GET: Получить задачи
  if (method === 'GET') {
    const { email } = req.query;
    
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
      // 1. Ищем пользователя
      const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      
      if (users.length === 0) {
        return res.json({ tasks: [] });
      }

      const userId = users[0].id;

      // 2. Ищем задачи
      // ВАЖНО: Мы берем только те поля, которые реально есть в базе.
      // title превращаем в name для фронтенда.
      // Полей priority, type, date в базе нет, поэтому мы их не запрашиваем (они придут как undefined на фронт).
      const query = 'SELECT id, title as name, description, status, createdAt FROM tasks WHERE user_id = ?';
      
      const [tasks] = await pool.query(query, [userId]);
      
      return res.status(200).json({ tasks });
    } catch (error) {
      console.error('CRITICAL DATABASE ERROR in GET /tasks:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // POST: Создать задачу
  if (method === 'POST') {
    // Мы принимаем priority, type, date от фронта, но НЕ передаем их в базу, так как колонок нет.
    const { userId, title, description, status } = req.body;

    try {
      const [result] = await pool.query(
        'INSERT INTO tasks (user_id, title, description, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [userId, title, description || '', status || 'TO DO']
      );
      return res.status(201).json({ message: 'Task created', id: result.insertId });
    } catch (error) {
      console.error('CRITICAL DATABASE ERROR in POST /tasks:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // PUT: Обновить задачу
  if (method === 'PUT') {
    const { id, ...changes } = req.body;
    
    const dbFields = {};
    
    // Маппинг: берем данные с фронта и кладем в нужные колонки БД
    if (changes.name) dbFields.title = changes.name;
    if (changes.description) dbFields.description = changes.description;
    if (changes.status) dbFields.status = changes.status;
    
    // ВАЖНО: Мы игнорируем changes.priority, changes.type и changes.date, 
    // потому что в базе нет под них места.
    
    // Всегда обновляем updatedAt
    dbFields.updatedAt = new Date(); 

    if (Object.keys(dbFields).length === 0) return res.status(400).json({ message: 'No allowed changes provided' });

    try {
      const setClause = Object.keys(dbFields).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(dbFields), id];

      await pool.query(`UPDATE tasks SET ${setClause} WHERE id = ?`, values);
      return res.status(200).json({ message: 'Task updated' });
    } catch (error) {
      console.error('CRITICAL DATABASE ERROR in PUT /tasks:', error);
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
      console.error('CRITICAL DATABASE ERROR in DELETE /tasks:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}