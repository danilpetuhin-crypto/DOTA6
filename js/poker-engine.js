const PokerEngine = (() => {
  const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  const SUITS = ['s', 'h', 'd', 'c'];
  const SUIT_NAMES = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' };
  const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };
  const RANK_VALUES = {};
  RANKS.forEach((r, i) => { RANK_VALUES[r] = i + 2; });

  const HAND_NAMES = [
    'Старшая карта', 'Пара', 'Две пары', 'Сет', 'Стрит',
    'Флеш', 'Фулл-хаус', 'Каре', 'Стрит-флеш', 'Роял-флеш'
  ];

  function createDeck() {
    const deck = [];
    for (const s of SUITS) {
      for (const r of RANKS) deck.push(r + s);
    }
    return deck;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function parseCard(str) {
    if (!str || str.length < 2) return null;
    const rank = str[0] === '1' ? 'T' : str[0].toUpperCase();
    const suit = str[str.length - 1].toLowerCase();
    if (!RANK_VALUES[rank] || !SUITS.includes(suit)) return null;
    return rank + suit;
  }

  function cardDisplay(card) {
    const rank = card[0] === 'T' ? '10' : card[0];
    const suit = card[1];
    const red = suit === 'h' || suit === 'd';
    return {
      rank, suit: SUIT_SYMBOLS[suit], suitKey: SUIT_NAMES[suit],
      red, code: card
    };
  }

  function evaluate5(cards) {
    const values = cards.map(c => RANK_VALUES[c[0]]).sort((a, b) => b - a);
    const suits = cards.map(c => c[1]);
    const isFlush = suits.every(s => s === suits[0]);

    const counts = {};
    values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    const groups = Object.entries(counts)
      .map(([v, c]) => ({ v: +v, c }))
      .sort((a, b) => b.c - a.c || b.v - a.v);

    let isStraight = false;
    let straightHigh = 0;
    const uniq = [...new Set(values)].sort((a, b) => b - a);
    if (uniq.length === 5) {
      if (uniq[0] - uniq[4] === 4) {
        isStraight = true;
        straightHigh = uniq[0];
      } else if (uniq.join(',') === '14,5,4,3,2') {
        isStraight = true;
        straightHigh = 5;
      }
    }

    let type, kickers;
    if (isFlush && isStraight) {
      type = straightHigh === 14 ? 9 : 8;
      kickers = [straightHigh];
    } else if (groups[0].c === 4) {
      type = 7;
      kickers = [groups[0].v, groups[1].v];
    } else if (groups[0].c === 3 && groups[1].c === 2) {
      type = 6;
      kickers = [groups[0].v, groups[1].v];
    } else if (isFlush) {
      type = 5;
      kickers = values;
    } else if (isStraight) {
      type = 4;
      kickers = [straightHigh];
    } else if (groups[0].c === 3) {
      type = 3;
      kickers = [groups[0].v, ...values.filter(v => v !== groups[0].v)];
    } else if (groups[0].c === 2 && groups[1].c === 2) {
      type = 2;
      const pairs = groups.filter(g => g.c === 2).map(g => g.v).sort((a, b) => b - a);
      const kicker = values.find(v => !pairs.includes(v));
      kickers = [...pairs, kicker];
    } else if (groups[0].c === 2) {
      type = 1;
      kickers = [groups[0].v, ...values.filter(v => v !== groups[0].v)];
    } else {
      type = 0;
      kickers = values;
    }

    return { type, kickers, cards };
  }

  function bestHand(cards7) {
    if (cards7.length < 5) return null;
    let best = null;
    const n = cards7.length;
    for (let a = 0; a < n - 4; a++)
      for (let b = a + 1; b < n - 3; b++)
        for (let c = b + 1; c < n - 2; c++)
          for (let d = c + 1; d < n - 1; d++)
            for (let e = d + 1; e < n; e++) {
              const hand = evaluate5([cards7[a], cards7[b], cards7[c], cards7[d], cards7[e]]);
              if (!best || compareHands(hand, best) > 0) best = hand;
            }
    return best;
  }

  function compareHands(a, b) {
    if (a.type !== b.type) return a.type - b.type;
    for (let i = 0; i < Math.max(a.kickers.length, b.kickers.length); i++) {
      const diff = (a.kickers[i] || 0) - (b.kickers[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  function calculateEquity(holeCards, board, opponents = 1, simulations = 2000) {
    if (holeCards.length < 2) return { equity: 0, wins: 0, ties: 0, total: 0 };

    const known = [...holeCards, ...board].filter(Boolean);
    const deck = createDeck().filter(c => !known.includes(c));

    let wins = 0, ties = 0;

    for (let i = 0; i < simulations; i++) {
      const shuffled = shuffle(deck);
      let idx = 0;

      const simBoard = [...board];
      while (simBoard.length < 5) simBoard.push(shuffled[idx++]);

      const myBest = bestHand([...holeCards, ...simBoard]);
      let bestOpp = null;
      let tied = false;

      for (let o = 0; o < opponents; o++) {
        const oppHole = [shuffled[idx++], shuffled[idx++]];
        const oppBest = bestHand([...oppHole, ...simBoard]);
        if (!bestOpp || compareHands(oppBest, bestOpp) > 0) bestOpp = oppBest;
      }

      const cmp = compareHands(myBest, bestOpp);
      if (cmp > 0) wins++;
      else if (cmp === 0) ties++;
    }

    const equity = Math.round(((wins + ties * 0.5) / simulations) * 100);
    return { equity, wins, ties, total: simulations };
  }

  function getBoardTexture(board) {
    if (board.length < 3) return 'preflop';
    const suits = board.map(c => c[1]);
    const values = board.map(c => RANK_VALUES[c[0]]).sort((a, b) => a - b);
    const suitCounts = {};
    suits.forEach(s => { suitCounts[s] = (suitCounts[s] || 0) + 1; });
    const maxSuit = Math.max(...Object.values(suitCounts));
    const paired = new Set(values).size < values.length;

    if (maxSuit >= 3) return 'monotone';
    if (maxSuit === 2) return 'two-tone';
    if (paired) return 'paired';
    const gaps = values.slice(1).map((v, i) => v - values[i]);
    if (gaps.every(g => g <= 4) && values[values.length - 1] - values[0] <= 4) return 'connected';
    return 'dry';
  }

  function generateAdvice(holeCards, board, equity, hand, pot, isPro) {
    if (holeCards.length < 2) {
      return { text: 'Выберите две карманные карты для анализа.', action: null, actionClass: '' };
    }

    const handName = hand ? HAND_NAMES[hand.type] : '—';
    const texture = getBoardTexture(board);
    const boardCount = board.length;
    let action, actionClass, text;

    if (hand && hand.type >= 7) {
      action = 'РЕЙЗ';
      actionClass = 'raise';
      text = `У вас ${handName.toLowerCase()} — практически непобедимая рука на данной доске. Делайте ставку, чтобы получить оплату от сетов и карманных пар оппонентов.`;
    } else if (hand && hand.type >= 5) {
      action = equity > 70 ? 'РЕЙЗ' : 'КОЛЛ';
      actionClass = equity > 70 ? 'raise' : 'call';
      text = `Сильная рука — ${handName}. ${equity > 70 ? 'Ставьте для вэлью, оппоненты с худшими руками могут заплатить.' : 'Можно коллировать, но осторожно на опасных картах.'}`;
    } else if (hand && hand.type >= 3) {
      action = equity > 60 ? 'РЕЙЗ' : 'КОЛЛ';
      actionClass = equity > 60 ? 'raise' : 'call';
      text = `${handName} — хорошая made-hand. ${texture === 'monotone' ? 'Осторожно: доска одномастная, возможен флеш у оппонента.' : 'Продолжайте агрессию для защиты руки.'}`;
    } else if (equity >= 65) {
      action = 'РЕЙЗ';
      actionClass = 'raise';
      text = `Эквити ${equity}% — вы впереди. ${boardCount < 5 ? 'Ещё не все карты на столе, но текущая позиция сильная. Ставьте.' : 'Продолжайте давить оппонента.'}`;
    } else if (equity >= 45) {
      action = pot > 0 ? 'КОЛЛ' : 'ЧЕК';
      actionClass = pot > 0 ? 'call' : 'check';
      text = `Эквити около ${equity}%. ${pot > 500 ? 'При большом банке колл может быть оправдан.' : 'Играйте осторожно, следите за действиями оппонента.'}`;
    } else if (equity >= 25) {
      action = boardCount >= 4 ? 'ЧЕК' : 'КОЛЛ';
      actionClass = boardCount >= 4 ? 'check' : 'call';
      text = `Слабая позиция (${equity}% эквити). ${boardCount >= 4 ? 'Лучше чекнуть и посмотреть ривер.' : 'Можно попробовать дешёвый колл, если банк маленький.'}`;
    } else {
      action = 'ФОЛД';
      actionClass = 'fold';
      text = `Эквити всего ${equity}%. Рука слабая${hand ? ` (${handName})` : ''}. Рекомендуется сбросить карты, если оппонент ставит.`;
    }

    if (isPro && texture === 'monotone' && hand && hand.type < 5) {
      text += ' Pro-анализ: на одномастной доске диапазон оппонента смещён к флеш-дро и готовым флешам.';
    }

    if (!isPro && hand && hand.type >= 3) {
      text = text.split('.')[0] + '. Оформите Pro для детального анализа диапазона противника.';
    }

    return { text, action, actionClass, handName };
  }

  function estimateOpponentRange(equity, board, hand) {
    const combos = [];
    const oppEquity = 100 - equity;

    if (hand && hand.type >= 6) {
      combos.push({ name: 'Сет / Две пары', pct: 15 });
      combos.push({ name: 'Старшая пара', pct: 25 });
      combos.push({ name: 'Дро (флеш/стрит)', pct: 35 });
      combos.push({ name: 'Блеф / воздух', pct: 25 });
    } else if (hand && hand.type >= 3) {
      combos.push({ name: 'Старшая пара', pct: 30 });
      combos.push({ name: 'Дро', pct: 40 });
      combos.push({ name: 'Слабая пара', pct: 20 });
      combos.push({ name: 'Блеф', pct: 10 });
    } else {
      combos.push({ name: 'Сильная рука', pct: 20 });
      combos.push({ name: 'Средняя рука', pct: 30 });
      combos.push({ name: 'Дро', pct: 30 });
      combos.push({ name: 'Блеф', pct: 20 });
    }

    return { oppEquity, combos };
  }

  return {
    RANKS, SUITS, SUIT_NAMES, SUIT_SYMBOLS, HAND_NAMES,
    createDeck, parseCard, cardDisplay, bestHand, evaluate5,
    calculateEquity, generateAdvice, estimateOpponentRange, compareHands
  };
})();
