/**
 * API клиент для работы с Convex
 */
const API = (() => {
  // Convex URL - замените на ваш deployment URL после настройки
  const CONVEX_URL = window.location.origin + '/api';
  
  // Токен пользовательской сессии (JWT)
  let sessionToken = null;
  let currentUserId = null;

  // Установка токена и userId после логина
  function setSessionToken(token, userId) {
    sessionToken = token;
    currentUserId = userId;
  }

  // Очистка токена при выходе
  function clearSessionToken() {
    sessionToken = null;
    currentUserId = null;
  }

  // Получение токена
  function getSessionToken() {
    return sessionToken;
  }

  // Получение userId
  function getCurrentUserId() {
    return currentUserId;
  }

  async function request(endpoint, options = {}) {
    const url = `${CONVEX_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

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
    return result;
  }

  async function login(login, password) {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password })
    });
    return result;
  }

  async function logout() {
    clearSessionToken();
  }

  async function getCurrentUser() {
    if (!currentUserId) {
      throw new Error('Пользователь не авторизован');
    }
    return request('/auth/me', {
      method: 'POST',
      body: JSON.stringify({ userId: currentUserId })
    });
  }

  // === Сессии ===
  async function getSessions() {
    if (!currentUserId) throw new Error('Требуется авторизация');
    return request('/sessions/getByUser', {
      method: 'POST',
      body: JSON.stringify({ userId: currentUserId })
    });
  }

  async function createSession(name) {
    if (!currentUserId) throw new Error('Требуется авторизация');
    return request('/sessions/create', {
      method: 'POST',
      body: JSON.stringify({ userId: currentUserId, name })
    });
  }

  async function getSessionById(sessionId) {
    return request('/sessions/getById', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  }

  // === Анализы ===
  async function getAnalyses(sessionId) {
    return request('/analyses/getBySession', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  }

  async function createAnalysis(data) {
    if (!currentUserId) throw new Error('Требуется авторизация');
    return request('/analyses/create', {
      method: 'POST',
      body: JSON.stringify({ ...data, userId: currentUserId })
    });
  }

  async function deleteAnalysis(analysisId) {
    return request('/analyses/delete', {
      method: 'POST',
      body: JSON.stringify({ analysisId })
    });
  }

  return {
    request,
    setSessionToken,
    clearSessionToken,
    getSessionToken,
    getCurrentUserId,
    register,
    login,
    logout,
    getCurrentUser,
    getSessions,
    createSession,
    getSessionById,
    getAnalyses,
    createAnalysis,
    deleteAnalysis
  };
})();

