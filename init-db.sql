-- Таблица пользователей
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
);

-- Таблица сессий
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Текущая сессия',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица анализов
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
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_session_id ON analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);
