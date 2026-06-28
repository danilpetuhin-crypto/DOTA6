const Analysis = require('../../models/Analysis');
const Session = require('../../models/Session');
const { authMiddleware } = require('../../lib/auth');

module.exports.config = {
  api: {
    external: true,
  },
};

module.exports = async function handler(req, res) {
  await authMiddleware(req, res, () => {});

  if (!req.user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  if (req.method === 'GET') {
    const { sessionId } = req.query;
    const analyses = await Analysis.findBySessionId(sessionId);
    return res.json(analyses);
  }

  if (req.method === 'POST') {
    const { sessionId, hole, board, equity, combo, action, actionClass, pot, outcome, createdAt } = req.body;
    
    // Проверка: сессия принадлежит пользователю
    const session = await Session.findByIdAndUser(sessionId, req.user.id);
    if (!session) {
      return res.status(404).json({ message: 'Сессия не найдена' });
    }

    const analysis = await Analysis.create({
      sessionId,
      userId: req.user.id,
      hole,
      board,
      equity,
      combo,
      action,
      actionClass,
      pot,
      outcome,
      createdAt
    });
    return res.status(201).json(analysis);
  }

  res.status(405).json({ message: 'Метод не разрешён' });
}

export default handler;
