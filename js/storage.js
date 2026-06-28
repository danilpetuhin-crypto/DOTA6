/**
 * Storage module - работа только через API
 * LocalStorage для токена сессии
 */
const Storage = (() => {
  const TOKEN_KEY = 'mp_session_token';
  const USER_ID_KEY = 'mp_user_id';
  
  // Кэш текущего пользователя в памяти
  let currentUserCache = null;

  // === Токен сессии ===
  function saveSessionToken(token, userId) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    if (userId) {
      localStorage.setItem(USER_ID_KEY, userId);
    } else {
      localStorage.removeItem(USER_ID_KEY);
    }
  }

  function getSessionToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUserId() {
    return localStorage.getItem(USER_ID_KEY);
  }

  function clearSessionToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
  }

  // === Работа с текущим пользователем (только кэш в памяти) ===
  function getUser() {
    return currentUserCache;
  }

  function setUser(user) {
    currentUserCache = user;
  }

  function clearUser() {
    currentUserCache = null;
  }

  function isLoggedIn() {
    return currentUserCache !== null;
  }

  function getUsername() {
    return currentUserCache?.login || currentUserCache?.username;
  }

  function getUserPlan() {
    return currentUserCache?.subscription || 'free';
  }

  function isPro() {
    return currentUserCache?.subscription === 'pro';
  }

  function getAnalysesToday() {
    return currentUserCache?.analysesToday || 0;
  }

  function setAnalysesToday(count) {
    if (currentUserCache) {
      currentUserCache.analysesToday = count;
    }
  }

  function incrementAnalysesToday() {
    if (currentUserCache) {
      currentUserCache.analysesToday = (currentUserCache.analysesToday || 0) + 1;
    }
  }

  function canAnalyze() {
    if (!currentUserCache) return false;
    if (currentUserCache.subscription === 'pro') return true;
    return (currentUserCache.analysesToday || 0) < 5;
  }

  function getAnalysesLeft() {
    if (!currentUserCache) return 0;
    if (currentUserCache.subscription === 'pro') return Infinity;
    return Math.max(0, 5 - (currentUserCache.analysesToday || 0));
  }

  // === История (только API) ===
  async function getHistory() {
    const userId = getUserId();
    if (!userId) return [];
    try {
      const sessions = await API.getSessions();
      let allAnalyses = [];
      for (const session of sessions) {
        const analyses = await API.getAnalyses(session.id);
        allAnalyses = allAnalyses.concat(analyses.map(a => ({ ...a, sessionName: session.name })));
      }
      allAnalyses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return allAnalyses;
    } catch (e) {
      console.error('Ошибка загрузки истории:', e);
      return [];
    }
  }

  async function addHistory(entry) {
    const userId = getUserId();
    if (!userId) return null;
    try {
      const sessions = await API.getSessions();
      let session = sessions.find(s => s.name === 'Текущая сессия');
      
      if (!session) {
        const result = await API.createSession('Текущая сессия');
        session = result;
      }

      const analysis = await API.createAnalysis({
        ...entry,
        sessionId: session.id
      });
      return analysis;
    } catch (e) {
      console.error('Ошибка добавления в историю:', e);
      return null;
    }
  }

  return {
    saveSessionToken,
    getSessionToken,
    getUserId,
    clearSessionToken,
    getUser,
    setUser,
    clearUser,
    isLoggedIn,
    getUsername,
    getUserPlan,
    isPro,
    getAnalysesToday,
    setAnalysesToday,
    incrementAnalysesToday,
    canAnalyze,
    getAnalysesLeft,
    getHistory,
    addHistory
  };
})();
