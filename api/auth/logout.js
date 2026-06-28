export const config = {
  api: {
    external: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешён' });
  }

  // На клиенте просто удаляем токен
  res.json({ message: 'Выход выполнен' });
}
