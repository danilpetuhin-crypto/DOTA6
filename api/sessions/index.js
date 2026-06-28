const connectDB = require('../../lib/db');
const Session = require('../../models/Session');
const { authMiddleware } = require('../../lib/auth');

module.exports.config = {
  api: {
    external: true,
  },
};

module.exports = async function handler(req, res) {
  await connectDB();
  await authMiddleware(req, res, () => {});

  if (!req.user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  if (req.method === 'GET') {
    // Получить все сессии пользователя
    const sessions = await Session.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(sessions);
  }

  if (req.method === 'POST') {
    // Создать сессию
    const { name, createdAt } = req.body;
    const session = new Session({
      userId: req.user._id,
      name: name || 'Текущая сессия',
      createdAt: createdAt || new Date()
    });
    await session.save();
    return res.status(201).json(session);
  }

  res.status(405).json({ message: 'Метод не разрешён' });
}

export default handler;
