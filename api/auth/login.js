const User = require('../../models/User');
const { generateToken } = require('../../lib/auth');

module.exports.config = {
  api: {
    external: true,
  },
};

module.exports = async function handler(req, res) {
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

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        login: user.login,
        subscription: user.subscription,
        analysesToday: user.analyses_today,
        subExpires: user.sub_expires
      },
      token
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}
