import pool from '../db.js';

export default async function handler(req, res) {
  const { method } = req;
  console.log(`API Tasks called with method: ${method}`);

  // GET: Получить задачи
  if (method === 'GET') {
    const { email } = req.query;
    console.log(`Fetching tasks for email: ${email}`);
    
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
      // 1. Ищем пользователя
      const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      
      if (users.length === 0) {
        console.log('User not found, returning empty tasks list');
        return res.json({ tasks: [] });
      }

      const userId = users[0].id;
      console.log(`User ID found: ${userId}, fetching tasks...`);

      // 2. Ищем задачи (ОБРАТИ ВНИМАНИЕ на названия колонок)
      // В коде title, но для фронта мы переименовываем его в name (title as name)
      const query = 'SELECT id, title as name, description, status, priority, type, date, createdAt FROM tasks WHERE user_id = ?';
      
      const [tasks] = await pool.query(query, [userId]);
      console.log(`Found ${tasks.length} tasks`);
      
      return res.status(200).json({ tasks });
    } catch (error) {
      // ВОТ ЗДЕСЬ мы увидим реальную ошибку в логах Vercel
      console.error('CRITICAL DATABASE ERROR in GET /tasks:', error);
      return res.status(500).json({ error: error.message, details: 'Check Vercel logs' });
    }
  }

  // POST: Создать задачу
  if (method === 'POST') {
    const { userId, title, description, status, priority, type, date } = req.body;
    console.log('Creating task for user:', userId);

    try {
      const [result] = await pool.query(
        'INSERT INTO tasks (user_id, title, description, status, priority, type, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [userId, title, description || '', status, priority || 'none', type || 'task', date || null]
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
    console.log('Updating task:', id, changes);
    
    const dbFields = {};
    // Важно: маппинг name -> title
    if (changes.name) dbFields.title = changes.name;
    if (changes.description) dbFields.description = changes.description;
    if (changes.status) dbFields.status = changes.status;
    if (changes.priority) dbFields.priority = changes.priority;
    if (changes.type) dbFields.type = changes.type;
    if (changes.date !== undefined) dbFields.date = changes.date;

    if (Object.keys(dbFields).length === 0) return res.status(400).json({ message: 'No changes provided' });

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
    console.log('Deleting task:', id);
    try {
      await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
      return res.status(200).json({ message: 'Task deleted' });
    } catch (error) {
      console.error('CRITICAL DATABASE ERROR in DELETE /tasks:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}