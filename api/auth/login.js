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

    if (!login || !password) {
      return res.status(400).json({ message: 'Заполните логин и пароль' });
    }

    const user = await User.findByLogin(login);
    if (!user) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const isMatch = await User.comparePassword(user, password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        login: user.login,
        subscription: user.subscription,
        analysesToday: user.analysesToday,
        subExpires: user.subExpires
      },
      token
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}
