const connectDB = require('../lib/db');
const Analysis = require('../models/Analysis');
const Session = require('../models/Session');
const { authMiddleware } = require('../lib/auth');

export const config = {
  api: {
    external: true,
  },
};

async function handler(req, res) {
  await connectDB();
  await authMiddleware(req, res, () => {});

  if (!req.user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  if (req.method === 'GET') {
    // Получить анализы сессии
    const { sessionId } = req.query;
    const analyses = await Analysis.find({ sessionId }).sort({ createdAt: -1 });
    return res.json(analyses);
  }

  if (req.method === 'POST') {
    // Создать анализ
    const { sessionId, hole, board, equity, combo, action, actionClass, pot, outcome, createdAt } = req.body;
    
    // Проверка: сессия принадлежит пользователю
    const session = await Session.findOne({ _id: sessionId, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Сессия не найдена' });
    }

    const analysis = new Analysis({
      sessionId,
      hole,
      board,
      equity,
      combo,
      action,
      actionClass,
      pot,
      outcome,
      createdAt: createdAt || new Date()
    });
    await analysis.save();
    return res.status(201).json(analysis);
  }

  res.status(405).json({ message: 'Метод не разрешён' });
}

export default handler;
