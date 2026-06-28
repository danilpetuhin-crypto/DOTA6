const { query } = require('../lib/db');

class Session {
  static async findByUserId(userId) {
    const result = await query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM sessions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByIdAndUser(id, userId) {
    const result = await query('SELECT * FROM sessions WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0] || null;
  }

  static async create({ userId, name }) {
    const result = await query(
      'INSERT INTO sessions (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name || 'Текущая сессия']
    );
    return result.rows[0];
  }

  static async deleteByIdAndUser(id, userId) {
    await query('DELETE FROM sessions WHERE id = $1 AND user_id = $2', [id, userId]);
  }
}

module.exports = Session;
