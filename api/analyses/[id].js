import { Analysis } from '../../models/Analysis.js';
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

  const { id } = req.query;

  if (req.method === 'DELETE') {
    await Analysis.deleteById(id);
    return res.json({ message: 'Анализ удалён' });
  }

  res.status(405).json({ message: 'Метод не разрешён' });
}

export default handler;
