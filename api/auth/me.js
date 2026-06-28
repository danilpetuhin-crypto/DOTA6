import { authMiddleware } from '../../lib/auth.js';

export const config = {
  api: {
    external: true,
  },
};

export default async function handler(req, res) {
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
      analysesToday: req.user.analysesToday,
      subExpires: req.user.subExpires
    });
  } catch (err) {
    console.error('Ошибка получения пользователя:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export default handler;
