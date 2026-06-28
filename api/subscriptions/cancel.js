import { User } from '../../models/User.js';
import { authMiddleware } from '../../lib/auth.js';

export const config = {
  api: {
    external: true,
  },
};

export default async function handler(req, res) {
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
