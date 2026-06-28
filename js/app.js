(function () {
  // Проверяем авторизацию
  if (!Storage.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  let board = [null, null, null, null, null];
  let hole = [null, null];
  let activeSlot = { type: 'board', index: 0 };
  let outcome = 'win';
  let currentSessionId = null;

  const els = {
    boardSlots: document.getElementById('board-slots'),
    handSlots: document.getElementById('hand-slots'),
    deckGrid: document.getElementById('deck-grid'),
    equityValue: document.getElementById('equity-value'),
    equityRing: document.getElementById('equity-ring'),
    comboName: document.getElementById('combo-name'),
    comboCards: document.getElementById('combo-cards'),
    adviceText: document.getElementById('advice-text'),
    adviceAction: document.getElementById('advice-action'),
    advicePanel: document.getElementById('advice-panel'),
    oppPanel: document.getElementById('opponent-panel'),
    oppEquityBar: document.getElementById('opp-equity-bar'),
    oppEquityVal: document.getElementById('opp-equity-val'),
    oppCombos: document.getElementById('opp-combos'),
    analyzeBtn: document.getElementById('analyze-btn'),
    resetBtn: document.getElementById('reset-cards'),
    potAmount: document.getElementById('pot-amount'),
    userName: document.getElementById('user-name'),
    userAvatar: document.getElementById('user-avatar'),
    userLicense: document.getElementById('user-license'),
    analysesLeft: document.getElementById('analyses-left'),
    historyList: document.getElementById('history-list'),
    pageTitle: document.getElementById('page-title'),
  };

  init();

  async function init() {
    await loadSession();
    renderUserInfo();
    buildDeckGrid();
    renderAllSlots();
    bindEvents();
    updateProLock();
  }

  async function loadSession() {
    try {
      const userId = Storage.getUserId();
      const sessions = await API.getSessions(userId);
      let session = sessions.find(s => s.name === 'Текущая сессия');
      
      if (!session) {
        session = await API.createSession(userId, {
          name: 'Текущая сессия',
          createdAt: new Date().toISOString()
        });
      }
      currentSessionId = session.id;
    } catch (e) {
      console.error('Ошибка загрузки сессии:', e);
    }
  }

  function renderUserInfo() {
    const user = Storage.getUser();
    if (!user) return;

    els.userName.textContent = user.login || user.username;
    els.userAvatar.textContent = (user.login || user.username || '?')[0].toUpperCase();
    const pro = Storage.isPro();
    els.userLicense.textContent = pro ? 'Pro Лицензия' : 'Free';
    els.userLicense.className = 'user-license' + (pro ? '' : ' free');
    updateAnalysesLeft();

    document.getElementById('settings-username').textContent = user.login || user.username;
    document.getElementById('settings-plan').textContent = pro ? 'Pro' : 'Free';
    updateSettingsAnalyses();

    const subBtn = document.getElementById('subscribe-btn');
    const cancelBtn = document.getElementById('cancel-sub-btn');
    const subExpires = document.getElementById('sub-expires');

    if (pro && user.subExpires) {
      subBtn.style.display = 'none';
      cancelBtn.style.display = 'block';
      const keyInfo = user.licenseKey ? ' · Ключ: ' + user.licenseKey : '';
      subExpires.textContent = 'Активна до ' + new Date(user.subExpires).toLocaleDateString('ru-RU') + keyInfo;
    } else {
      subBtn.style.display = 'block';
      cancelBtn.style.display = 'none';
      subExpires.textContent = '';
    }
  }

  function updateAnalysesLeft() {
    if (Storage.isPro()) {
      els.analysesLeft.textContent = 'Pro — безлимит';
    } else {
      const left = Storage.getAnalysesLeft();
      els.analysesLeft.textContent = `Осталось анализов: ${left}/5`;
    }
  }

  function updateSettingsAnalyses() {
    const count = Storage.getAnalysesToday();
    document.getElementById('settings-analyses').textContent =
      Storage.isPro() ? 'Безлимит' : `${count} / 5`;
  }

  function updateProLock() {
    els.oppPanel.classList.toggle('locked', !Storage.isPro());
  }

  function buildDeckGrid() {
    const suitOrder = ['s', 'h', 'd', 'c'];
    const suitLabels = { s: '♠', h: '♥', d: '♦', c: '♣' };
    const suitClasses = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' };
    let html = '';

    for (const suit of suitOrder) {
      html += `<div class="deck-suit"><div class="deck-suit-label ${suitClasses[suit]}">${suitLabels[suit]}</div><div class="deck-row">`;
      for (const rank of PokerEngine.RANKS) {
        const code = rank + suit;
        const display = rank === 'T' ? '10' : rank;
        html += `<button class="deck-btn ${suitClasses[suit]}" data-card="${code}">${display}</button>`;
      }
      html += '</div></div>';
    }
    els.deckGrid.innerHTML = html;

    els.deckGrid.querySelectorAll('.deck-btn').forEach(btn => {
      btn.addEventListener('click', () => selectCard(btn.dataset.card));
    });
  }

  function getUsedCards() {
    return [...board, ...hole].filter(Boolean);
  }

  function updateDeckButtons() {
    const used = getUsedCards();
    els.deckGrid.querySelectorAll('.deck-btn').forEach(btn => {
      btn.disabled = used.includes(btn.dataset.card);
    });
  }

  function renderCardEl(card, mini) {
    const d = PokerEngine.cardDisplay(card);
    const cls = 'playing-card' + (d.red ? ' red' : ' black') + (mini ? ' mini' : '');
    return `<div class="${cls}"><span class="rank">${d.rank}</span><span class="suit">${d.suit}</span></div>`;
  }

  function renderSlot(container, card, type, index) {
    const isActive = activeSlot.type === type && activeSlot.index === index;
    if (card) {
      return `<div class="card-slot filled${isActive ? ' active' : ''}" data-type="${type}" data-index="${index}">${renderCardEl(card)}</div>`;
    }
    return `<div class="card-slot${isActive ? ' active' : ''}" data-type="${type}" data-index="${index}"><span class="slot-plus">+</span></div>`;
  }

  function renderAllSlots() {
    els.boardSlots.innerHTML = board.map((c, i) => renderSlot(null, c, 'board', i)).join('');
    els.handSlots.innerHTML = hole.map((c, i) => renderSlot(null, c, 'hole', i)).join('');
    bindSlotClicks();
    updateDeckButtons();
  }

  function bindSlotClicks() {
    document.querySelectorAll('.card-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        activeSlot = { type: slot.dataset.type, index: +slot.dataset.index };
        renderAllSlots();
      });
      slot.addEventListener('dblclick', () => {
        const { type, index } = slot.dataset;
        if (type === 'board') board[+index] = null;
        else hole[+index] = null;
        activeSlot = { type, index: +index };
        renderAllSlots();
        quickPreview();
      });
    });
  }

  function selectCard(code) {
    const used = getUsedCards();
    if (used.includes(code)) return;

    if (activeSlot.type === 'board') {
      board[activeSlot.index] = code;
      const nextEmpty = board.findIndex((c, i) => !c && i > activeSlot.index);
      if (nextEmpty !== -1) activeSlot.index = nextEmpty;
      else if (activeSlot.index < 4) activeSlot.index++;
    } else {
      hole[activeSlot.index] = code;
      if (activeSlot.index === 0 && !hole[1]) activeSlot.index = 1;
    }

    renderAllSlots();
    quickPreview();
  }

  function quickPreview() {
    const known = [...hole.filter(Boolean), ...board.filter(Boolean)];
    if (known.length < 2) return;

    const allCards = [...hole.filter(Boolean), ...board.filter(Boolean)];
    if (allCards.length >= 5) {
      const hand = PokerEngine.bestHand(allCards);
      els.comboName.textContent = PokerEngine.HAND_NAMES[hand.type];
      els.comboCards.innerHTML = hand.cards.map(c => renderCardEl(c, true)).join('');
    } else if (hole.filter(Boolean).length === 2) {
      els.comboName.textContent = 'Ждём борд...';
      els.comboCards.innerHTML = hole.filter(Boolean).map(c => renderCardEl(c, true)).join('');
    }
  }

  function bindEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        switchPage(item.dataset.page);
      });
    });

    document.querySelectorAll('.outcome-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.outcome-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        outcome = btn.dataset.outcome;
      });
    });

    els.resetBtn.addEventListener('click', resetAll);
    els.analyzeBtn.addEventListener('click', runAnalysis);
    document.getElementById('new-session-btn').addEventListener('click', resetAll);
    document.getElementById('logout-btn').addEventListener('click', async () => {
      try {
        await API.logout();
      } catch (e) {}
      Storage.clearSessionToken();
      Storage.clearUser();
      window.location.href = 'index.html';
    });

    document.getElementById('subscribe-btn').addEventListener('click', () => {
      document.getElementById('license-key').value = '';
      document.getElementById('key-error').textContent = '';
      openModal('sub-modal');
    });
    document.getElementById('confirm-sub-btn').addEventListener('click', async () => {
      const keyInput = document.getElementById('license-key');
      const keyError = document.getElementById('key-error');
      
      try {
        const result = await API.activateSubscription(Storage.getUserId(), keyInput.value);
        Storage.setUser(result.user);
        keyError.textContent = '';
        closeModal('sub-modal');
        renderUserInfo();
        updateProLock();
      } catch (error) {
        keyError.textContent = error.message || 'Ошибка активации';
      }
    });
    document.getElementById('license-key').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('confirm-sub-btn').click();
    });
    document.getElementById('cancel-sub-btn').addEventListener('click', async () => {
      try {
        await API.cancelSubscription(Storage.getUserId());
        const user = Storage.getUser();
        user.subscription = 'free';
        user.subExpires = null;
        Storage.setUser(user);
        renderUserInfo();
        updateProLock();
      } catch (error) {
        console.error('Ошибка отмены подписки:', error);
      }
    });
    document.getElementById('limit-upgrade-btn').addEventListener('click', () => {
      closeModal('limit-modal');
      switchPage('settings');
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay').classList.remove('open');
      });
    });
  }

  function switchPage(page) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');

    const titles = { analyzer: 'AI Анализатор', history: 'История', settings: 'Настройки' };
    els.pageTitle.textContent = titles[page] || '';

    if (page === 'history') renderHistory();
    if (page === 'settings') renderUserInfo();
  }

  function resetAll() {
    board = [null, null, null, null, null];
    hole = [null, null];
    activeSlot = { type: 'board', index: 0 };
    els.potAmount.value = 0;
    els.equityValue.textContent = '—';
    els.equityRing.style.strokeDashoffset = 327;
    els.comboName.textContent = '—';
    els.comboCards.innerHTML = '';
    els.adviceText.textContent = 'Выберите карты и нажмите «Запустить глубокий анализ»';
    els.adviceAction.style.display = 'none';
    els.oppEquityBar.style.width = '0';
    els.oppEquityVal.textContent = '—';
    els.oppCombos.innerHTML = '';
    renderAllSlots();
  }

  async function runAnalysis() {
    const h = hole.filter(Boolean);
    if (h.length < 2) {
      els.adviceText.textContent = 'Сначала выберите две карманные карты!';
      return;
    }

    if (!Storage.canAnalyze()) {
      openModal('limit-modal');
      return;
    }

    Storage.incrementAnalysesToday();
    updateAnalysesLeft();
    updateSettingsAnalyses();

    const b = board.filter(Boolean);
    const allCards = [...h, ...b];
    const hand = allCards.length >= 5 ? PokerEngine.bestHand(allCards) : null;
    const sims = Storage.isPro() ? 3000 : 1500;
    const { equity } = PokerEngine.calculateEquity(h, b, 1, sims);
    const pot = parseInt(els.potAmount.value) || 0;
    const advice = PokerEngine.generateAdvice(h, b, equity, hand, pot, Storage.isPro());

    els.equityValue.textContent = equity + '%';
    const offset = 327 - (327 * equity / 100);
    els.equityRing.style.strokeDashoffset = offset;

    if (hand) {
      els.comboName.textContent = advice.handName || PokerEngine.HAND_NAMES[hand.type];
      els.comboCards.innerHTML = hand.cards.map(c => renderCardEl(c, true)).join('');
    } else {
      els.comboName.textContent = 'Префлоп';
      els.comboCards.innerHTML = h.map(c => renderCardEl(c, true)).join('');
    }

    els.adviceText.textContent = advice.text;
    if (advice.action) {
      els.adviceAction.textContent = advice.action;
      els.adviceAction.className = 'btn btn-action ' + advice.actionClass;
      els.adviceAction.style.display = 'block';
    } else {
      els.adviceAction.style.display = 'none';
    }

    if (Storage.isPro()) {
      const opp = PokerEngine.estimateOpponentRange(equity, b, hand);
      els.oppEquityBar.style.width = equity + '%';
      els.oppEquityVal.textContent = equity + '%';
      els.oppCombos.innerHTML = opp.combos.map(c =>
        `<div class="opp-combo-item"><span>${c.name}</span><span>${c.pct}%</span></div>`
      ).join('');
    }

    // Сохраняем в историю через API
    await Storage.addHistory({
      hole: h,
      board: b,
      equity,
      combo: hand ? PokerEngine.HAND_NAMES[hand.type] : 'Префлоп',
      action: advice.action || '—',
      actionClass: advice.actionClass || '',
      pot,
      outcome,
      createdAt: new Date().toISOString()
    });
  }

  async function renderHistory() {
    els.historyList.innerHTML = '<p class="empty-state">Загрузка истории...</p>';
    
    try {
      const history = await Storage.getHistory();
      if (!history.length) {
        els.historyList.innerHTML = '<p class="empty-state">История пуста. Проведите первый анализ!</p>';
        return;
      }

      els.historyList.innerHTML = history.map(item => {
        const date = new Date(item.createdAt).toLocaleString('ru-RU');
        const cards = [...(item.hole || []), ...(item.board || [])].map(c => {
          const d = PokerEngine.cardDisplay(c);
          return d.rank + d.suit;
        }).join(' ');
        return `<div class="history-item">
          <div class="history-item-left">
            <div class="history-item-combo">${item.combo}</div>
            <div class="history-item-meta">${date} · ${cards} · $${item.pot || 0}</div>
          </div>
          <div class="history-item-equity">${item.equity}%</div>
          <span class="history-item-action ${item.actionClass}">${item.action}</span>
        </div>`;
      }).join('');
    } catch (e) {
      els.historyList.innerHTML = '<p class="empty-state">Ошибка загрузки истории</p>';
      console.error('Ошибка истории:', e);
    }
  }

  function openModal(id) {
    document.getElementById(id).classList.add('open');
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
  }
})();
