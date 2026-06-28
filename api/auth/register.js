const connectDB = require('../lib/db');
const User = require('../models/User');
const { generateToken } = require('../lib/auth');

export const config = {
  api: {
    external: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешён' });
  }

  try {
    await connectDB();

    const { login, password } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';

    if (!login || !password) {
      return res.status(400).json({ message: 'Заполните логин и пароль' });
    }

    // Проверка: 1 IP = 1 аккаунт
    const existingByIP = await User.findOne({ ip });
    if (existingByIP) {
      return res.status(403).json({ message: 'С этого устройства уже зарегистрирован аккаунт' });
    }

    // Проверка: логин занят
    const existingByLogin = await User.findOne({ login });
    if (existingByLogin) {
      return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
    }

    // Создание пользователя (пароль хэшируется в модели)
    const user = new User({
      login,
      password,
      ip
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        login: user.login,
        subscription: user.subscription,
        analysesToday: user.analysesToday
      },
      token
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}
