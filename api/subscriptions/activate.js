const connectDB = require('../lib/db');
const User = require('../models/User');
const { authMiddleware } = require('../lib/auth');

export const config = {
  api: {
    external: true,
  },
};

// Валидные лицензионные ключи
const VALID_KEYS = ['EKKL-812C-2DSL-L5VN', 'GCKL-241C-2DSL-L38N'];

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешён' });
  }

  await connectDB();
  await authMiddleware(req, res, () => {});

  if (!req.user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  try {
    const { licenseKey } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ message: 'Введите ключ активации' });
    }

    const normalizedKey = licenseKey.trim().toUpperCase();

    if (!VALID_KEYS.includes(normalizedKey)) {
      return res.status(400).json({ message: 'Неверный ключ активации' });
    }

    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней

    await User.findByIdAndUpdate(req.user._id, {
      subscription: 'pro',
      subExpires: expires,
      licenseKey: normalizedKey
    });

    res.json({
      message: 'Pro активирован',
      user: {
        id: req.user._id,
        login: req.user.login,
        subscription: 'pro',
        subExpires: expires
      }
    });
  } catch (err) {
    console.error('Ошибка активации подписки:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export default handler;
