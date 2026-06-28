(function () {
  checkAuth();

  async function checkAuth() {
    const savedToken = Storage.getSessionToken();
    const savedUserId = Storage.getUserId();
    
    if (document.body.classList.contains('auth-page')) {
      // Если есть токен, пробуем загрузить пользователя через API
      if (savedToken && savedUserId) {
        try {
          const user = await API.getCurrentUser();
          Storage.setUser(user);
          window.location.href = 'app.html';
          return;
        } catch (e) {
          // Токен невалиден, очищаем
          Storage.clearSessionToken();
          Storage.clearUserId();
        }
      }
      initAuthPage();
    } else {
      // На страницах приложения требуется авторизация
      if (!savedToken || !savedUserId) {
        window.location.href = 'index.html';
        return;
      }

      // Пытаемся загрузить данные пользователя
      try {
        const user = await API.getCurrentUser();
        Storage.setUser(user);
      } catch (e) {
        Storage.clearSessionToken();
        Storage.clearUserId();
        Storage.clearUser();
        window.location.href = 'index.html';
      }
    }
  }

  function initAuthPage() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        loginForm.classList.toggle('active', target === 'login');
        registerForm.classList.toggle('active', target === 'register');
        document.getElementById('login-error').textContent = '';
        document.getElementById('register-error').textContent = '';
      });
    });

    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const login = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const errEl = document.getElementById('login-error');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!login || !password) {
        errEl.textContent = 'Заполните все поля';
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Вход...';
        
        const result = await API.login(login, password);
        Storage.setUser(result);
        if (result.userId) {
          Storage.saveSessionToken(result.userId, result.userId);
          API.setSessionToken(result.userId, result.userId);
        }
        window.location.href = 'app.html';
      } catch (error) {
        errEl.textContent = error.message || 'Ошибка входа';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Войти';
      }
    });

    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const login = document.getElementById('reg-username').value.trim();
      const password = document.getElementById('reg-password').value;
      const password2 = document.getElementById('reg-password2').value;
      const errEl = document.getElementById('register-error');
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(login)) {
        errEl.textContent = 'Логин: 3–20 символов, буквы, цифры, _';
        return;
      }
      if (password.length < 6) {
        errEl.textContent = 'Пароль минимум 6 символов';
        return;
      }
      if (password !== password2) {
        errEl.textContent = 'Пароли не совпадают';
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Создание...';
        
        const result = await API.register(login, password);
        if (result.userId) {
          Storage.saveSessionToken(result.userId, result.userId);
          API.setSessionToken(result.userId, result.userId);
          Storage.setUser({ id: result.userId, login, subscription: 'free', analysesToday: 0 });
        }
        window.location.href = 'app.html';
      } catch (error) {
        // Проверка на ошибку "один IP = один аккаунт"
        if (error.message.includes('IP') || error.message.includes('устройства')) {
          errEl.textContent = 'С этого устройства уже зарегистрирован аккаунт';
        } else {
          errEl.textContent = error.message || 'Ошибка регистрации';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Создать аккаунт';
      }
    });
  }
})();
