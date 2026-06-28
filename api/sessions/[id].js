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

  const { id } = req.query;

  if (req.method === 'DELETE') {
    await Session.deleteByIdAndUser(id, req.user.id);
    return res.json({ message: 'Сессия удалена' });
  }

  res.status(405).json({ message: 'Метод не разрешён' });
}

export default handler;
