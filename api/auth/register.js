import { User } from '../../models/User.js';
import { generateToken } from '../../lib/auth.js';

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
    const { login, password } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';

    if (!login || !password) {
      return res.status(400).json({ message: 'Заполните логин и пароль' });
    }

    // Проверка: 1 IP = 1 аккаунт
    const existingByIP = await User.findByIp(ip);
    if (existingByIP) {
      return res.status(403).json({ message: 'С этого устройства уже зарегистрирован аккаунт' });
    }

    // Проверка: логин занят
    const existingByLogin = await User.findByLogin(login);
    if (existingByLogin) {
      return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
    }

    const user = await User.create({ login, password, ip });
    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
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
