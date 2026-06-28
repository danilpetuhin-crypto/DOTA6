/**
 * API клиент для работы с Vercel сервером
 * Использует JWT токены
 */
const API = (() => {
  // URL сервера
  const API_URL = 'https://majestic-poker1.vercel.app/api';

  // Токен пользовательской сессии (JWT)
  let sessionToken = null;

  // Установка токена после логина
  function setSessionToken(token) {
    sessionToken = token;
  }

  // Очистка токена при выходе
  function clearSessionToken() {
    sessionToken = null;
  }

  // Получение токена для проверки авторизации
  function getSessionToken() {
    return sessionToken;
  }

  // Установка токена после логина
  function setSessionToken(token) {
    sessionToken = token;
  }

  // Очистка токена при выходе
  function clearSessionToken() {
    sessionToken = null;
  }

  // Получение токена для проверки авторизации
  function getSessionToken() {
    return sessionToken;
  }

  async function request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Добавляем токен сессии если есть
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Ошибка сети' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // === Аутентификация ===
  async function register(login, password) {
    const result = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ login, password })
    });
    if (result.token) {
      setSessionToken(result.token);
    }
    return result;
  }

  async function login(login, password) {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password })
    });
    if (result.token) {
      setSessionToken(result.token);
    }
    return result;
  }

  async function logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearSessionToken();
    }
  }

  async function getCurrentUser() {
    return request('/auth/me');
  }

  // === Пользователи ===
  async function getUser(userId) {
    return request(`/users/${userId}`);
  }

  async function updateUser(userId, data) {
    return request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // === Сессии ===
  async function getSessions(userId) {
    return request(`/sessions?userId=${userId}`);
  }

  async function createSession(userId, data) {
    return request('/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId, ...data })
    });
  }

  async function updateSession(sessionId, data) {
    return request(`/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async function deleteSession(sessionId) {
    return request(`/sessions/${sessionId}`, { method: 'DELETE' });
  }

  // === Анализы (история) ===
  async function getAnalyses(sessionId) {
    return request(`/analyses?sessionId=${sessionId}`);
  }

  async function createAnalysis(sessionId, data) {
    return request('/analyses', {
      method: 'POST',
      body: JSON.stringify({ sessionId, ...data })
    });
  }

  async function deleteAnalysis(analysisId) {
    return request(`/analyses/${analysisId}`, { method: 'DELETE' });
  }

  // === Подписки ===
  async function getSubscription(userId) {
    return request(`/subscriptions?userId=${userId}`);
  }

  async function activateSubscription(userId, licenseKey) {
    return request('/subscriptions/activate', {
      method: 'POST',
      body: JSON.stringify({ userId, licenseKey })
    });
  }

  async function cancelSubscription(userId) {
    return request(`/subscriptions/${userId}/cancel`, {
      method: 'POST'
    });
  }

  // === Статистика ===
  async function getUserStats(userId) {
    return request(`/stats/${userId}`);
  }

  return {
    request,
    setSessionToken,
    clearSessionToken,
    getSessionToken,
    register,
    login,
    logout,
    getCurrentUser,
    getUser,
    updateUser,
    getSessions,
    createSession,
    updateSession,
    deleteSession,
    getAnalyses,
    createAnalysis,
    deleteAnalysis,
    getSubscription,
    activateSubscription,
    cancelSubscription,
    getUserStats
  };
})();

