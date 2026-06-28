const { authMiddleware } = require('../../lib/auth');

module.exports.config = {
  api: {
    external: true,
  },
};

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Метод не разрешён' });
  }

  try {
    await authMiddleware(req, res, () => {});

    if (!req.user) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    res.json({
      id: req.user.id,
      login: req.user.login,
      subscription: req.user.subscription,
      analysesToday: req.user.analyses_today,
      subExpires: req.user.sub_expires
    });
  } catch (err) {
    console.error('Ошибка получения пользователя:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export default handler;
