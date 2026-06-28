const User = require('../../models/User');
const { authMiddleware } = require('../../lib/auth');

module.exports.config = {
  api: {
    external: true,
  },
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешён' });
  }

  await authMiddleware(req, res, () => {});

  if (!req.user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    await User.cancelSubscription(req.user.id);

    res.json({ message: 'Подписка отменена' });
  } catch (err) {
    console.error('Ошибка отмены подписки:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export default handler;
