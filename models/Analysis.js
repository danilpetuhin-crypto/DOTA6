const { query } = require('../lib/db');

class Analysis {
  static async findBySessionId(sessionId) {
    const result = await query('SELECT * FROM analyses WHERE session_id = $1 ORDER BY created_at DESC', [sessionId]);
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM analyses WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ sessionId, userId, hole, board, equity, combo, action, actionClass, pot, outcome, createdAt }) {
    const result = await query(
      `INSERT INTO analyses (session_id, user_id, hole, board, equity, combo, action, action_class, pot, outcome, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [sessionId, userId, hole, board || null, equity || null, combo || null, action, actionClass, pot || null, outcome || null, createdAt || new Date()]
    );
    return result.rows[0];
  }

  static async deleteById(id) {
    await query('DELETE FROM analyses WHERE id = $1', [id]);
  }
}

module.exports = Analysis;
