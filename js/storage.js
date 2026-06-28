const Storage = {
  USERS_KEY: 'majestic_poker_users',
  SESSION_KEY: 'majestic_poker_session',
  KEYS_KEY: 'majestic_poker_keys',

  VALID_KEYS: [
    'EKKL-812C-2DSL-L5VN',
    'GCKL-241C-2DSL-L38N'
  ],

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.USERS_KEY)) || {};
    } catch {
      return {};
    }
  },

  saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.SESSION_KEY));
    } catch {
      return null;
    }
  },

  setSession(username) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({ username }));
  },

  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  getUser(username) {
    return this.getUsers()[username] || null;
  },

  createUser(username, password) {
    const users = this.getUsers();
    if (users[username]) return { ok: false, error: 'Пользователь уже существует' };

    users[username] = {
      password: this._hash(password),
      plan: 'free',
      subExpires: null,
      analysesToday: 0,
      lastAnalysisDate: null,
      history: [],
      createdAt: Date.now()
    };
    this.saveUsers(users);
    return { ok: true };
  },

  updateUser(username, data) {
    const users = this.getUsers();
    if (!users[username]) return false;
    Object.assign(users[username], data);
    this.saveUsers(users);
    return true;
  },

  _hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return h.toString(36);
  },

  verifyPassword(username, password) {
    const user = this.getUser(username);
    if (!user) return false;
    return user.password === this._hash(password);
  },

  isPro(username) {
    const user = this.getUser(username);
    if (!user) return false;
    if (user.plan !== 'pro') return false;
    if (user.subExpires && Date.now() > user.subExpires) {
      this.updateUser(username, { plan: 'free', subExpires: null });
      return false;
    }
    return true;
  },

  normalizeKey(key) {
    return (key || '').trim().toUpperCase();
  },

  getUsedKeys() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS_KEY)) || {};
    } catch {
      return {};
    }
  },

  saveUsedKeys(keys) {
    localStorage.setItem(this.KEYS_KEY, JSON.stringify(keys));
  },

  activateProWithKey(username, rawKey) {
    const key = this.normalizeKey(rawKey);

    if (!key) {
      return { ok: false, error: 'Введите ключ активации' };
    }

    if (!this.VALID_KEYS.includes(key)) {
      return { ok: false, error: 'Неверный ключ активации' };
    }

    const usedKeys = this.getUsedKeys();
    const usedBy = usedKeys[key];

    if (usedBy && usedBy !== username) {
      return { ok: false, error: 'Этот ключ уже активирован другим пользователем' };
    }

    if (usedBy === username && this.isPro(username)) {
      return { ok: false, error: 'Pro уже активирован на вашем аккаунте' };
    }

    const expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
    usedKeys[key] = username;
    this.saveUsedKeys(usedKeys);
    this.updateUser(username, { plan: 'pro', subExpires: expires, licenseKey: key });

    return { ok: true, expires, key };
  },

  cancelPro(username) {
    this.updateUser(username, { plan: 'free', subExpires: null });
  },

  canAnalyze(username) {
    const user = this.getUser(username);
    if (!user) return false;
    if (this.isPro(username)) return true;

    const today = new Date().toDateString();
    if (user.lastAnalysisDate !== today) {
      this.updateUser(username, { analysesToday: 0, lastAnalysisDate: today });
      return true;
    }
    return user.analysesToday < 5;
  },

  incrementAnalysis(username) {
    const user = this.getUser(username);
    if (!user) return;
    const today = new Date().toDateString();
    let count = user.analysesToday || 0;
    if (user.lastAnalysisDate !== today) count = 0;
    this.updateUser(username, {
      analysesToday: count + 1,
      lastAnalysisDate: today
    });
  },

  addHistory(username, entry) {
    const user = this.getUser(username);
    if (!user) return;
    const history = user.history || [];
    history.unshift({ ...entry, id: Date.now() });
    const limit = this.isPro(username) ? 100 : 10;
    this.updateUser(username, { history: history.slice(0, limit) });
  },

  getHistory(username) {
    const user = this.getUser(username);
    return user ? (user.history || []) : [];
  },

  getAnalysesLeft(username) {
    if (this.isPro(username)) return Infinity;
    const user = this.getUser(username);
    if (!user) return 0;
    const today = new Date().toDateString();
    if (user.lastAnalysisDate !== today) return 5;
    return Math.max(0, 5 - (user.analysesToday || 0));
  }
};
