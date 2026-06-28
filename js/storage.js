/**
 * Storage module - работа только через API
 * LocalStorage НЕ используется
 */
const Storage = (() => {
  const TOKEN_KEY = 'mp_session_token';
  
  // Кэш текущего пользователя в памяти
  let currentUserCache = null;

  // === Токен сессии (только для persistence между перезагрузками) ===
  function saveSessionToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  function getSessionToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function clearSessionToken() {
    localStorage.removeItem(TOKEN_KEY);
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

  function getUserId() {
    return currentUserCache?.id;
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
    if (!currentUserCache) return [];
    try {
      const sessions = await API.getSessions(currentUserCache.id);
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
    if (!currentUserCache) return null;
    try {
      const sessions = await API.getSessions(currentUserCache.id);
      let session = sessions.find(s => s.name === 'Текущая сессия');
      
      if (!session) {
        const result = await API.createSession(currentUserCache.id, {
          name: 'Текущая сессия',
          createdAt: new Date().toISOString()
        });
        session = result;
      }

      const analysis = await API.createAnalysis(session.id, {
        ...entry,
        createdAt: new Date().toISOString()
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
    clearSessionToken,
    getUser,
    setUser,
    clearUser,
    isLoggedIn,
    getUserId,
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
