(function () {
  const session = Storage.getSession();

  if (document.body.classList.contains('auth-page')) {
    if (session) {
      window.location.href = 'app.html';
      return;
    }
    initAuthPage();
  } else {
    if (!session) {
      window.location.href = 'index.html';
      return;
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

    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const errEl = document.getElementById('login-error');

      if (!username || !password) {
        errEl.textContent = 'Заполните все поля';
        return;
      }
      if (!Storage.getUser(username)) {
        errEl.textContent = 'Пользователь не найден';
        return;
      }
      if (!Storage.verifyPassword(username, password)) {
        errEl.textContent = 'Неверный пароль';
        return;
      }
      Storage.setSession(username);
      window.location.href = 'app.html';
    });

    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('reg-username').value.trim();
      const password = document.getElementById('reg-password').value;
      const password2 = document.getElementById('reg-password2').value;
      const errEl = document.getElementById('register-error');

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        errEl.textContent = 'Имя: 3–20 символов, буквы, цифры, _';
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

      const result = Storage.createUser(username, password);
      if (!result.ok) {
        errEl.textContent = result.error;
        return;
      }
      Storage.setSession(username);
      window.location.href = 'app.html';
    });
  }
})();
