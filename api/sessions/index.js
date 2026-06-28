import { Session } from '../../models/Session.js';
import { authMiddleware } from '../../lib/auth.js';

export const config = {
  api: {
    external: true,
  },
};

export default async function handler(req, res) {
  await authMiddleware(req, res, () => {});

  if (!req.user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  if (req.method === 'GET') {
    const sessions = await Session.findByUserId(req.user.id);
    return res.json(sessions);
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    const session = await Session.create({ userId: req.user.id, name });
    return res.status(201).json(session);
  }

  res.status(405).json({ message: 'Метод не разрешён' });
}

export default handler;
