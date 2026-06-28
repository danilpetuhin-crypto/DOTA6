рconst { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

let initialized = false;

async function initDB() {
  if (initialized) return;
  
  try {
    // Создаём таблицу пользователей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        login TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        ip TEXT,
        subscription TEXT DEFAULT 'free',
        analyses_today INTEGER DEFAULT 0,
        sub_expires TIMESTAMP,
        license_key TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаём таблицу сессий
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT DEFAULT 'Текущая сессия',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаём таблицу анализов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        hole TEXT NOT NULL,
        board TEXT,
        equity DOUBLE PRECISION,
        combo TEXT,
        action TEXT NOT NULL,
        action_class TEXT NOT NULL,
        pot DOUBLE PRECISION,
        outcome TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаём индексы
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_analyses_session_id ON analyses(session_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_login ON users(login)`);

    initialized = true;
    console.log('База данных инициализирована');
  } catch (err) {
    console.error('Ошибка инициализации БД:', err.message);
  }
}

async function query(text, params) {
  await initDB();
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

module.exports = { query, pool, initDB };
