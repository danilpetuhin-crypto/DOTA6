const connectDB = require('../lib/db');
const Analysis = require('../models/Analysis');
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

  const { id } = req.query;

  if (req.method === 'DELETE') {
    await Analysis.findByIdAndDelete(id);
    return res.json({ message: 'Анализ удалён' });
  }

  res.status(405).json({ message: 'Метод не разрешён' });
}

export default handler;
