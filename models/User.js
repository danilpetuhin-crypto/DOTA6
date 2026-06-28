const bcrypt = require('bcryptjs');
const { query } = require('../lib/db');

class User {
  static async findByLogin(login) {
    const result = await query('SELECT * FROM users WHERE login = $1', [login]);
    return result.rows[0] || null;
  }

  static async findByIp(ip) {
    const result = await query('SELECT * FROM users WHERE ip = $1', [ip]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ login, password, ip }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (login, password, ip, subscription, analysesToday) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [login, hashedPassword, ip, 'free', 0]
    );
    return result.rows[0];
  }

  static async updateSubscription(userId, subscription, subExpires, licenseKey) {
    const result = await query(
      `UPDATE users SET subscription = $1, sub_expires = $2, license_key = $3 
       WHERE id = $4 RETURNING *`,
      [subscription, subExpires, licenseKey, userId]
    );
    return result.rows[0];
  }

  static async cancelSubscription(userId) {
    const result = await query(
      `UPDATE users SET subscription = 'free', sub_expires = NULL, license_key = NULL 
       WHERE id = $1 RETURNING *`,
      [userId]
    );
    return result.rows[0];
  }

  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

module.exports = User;
