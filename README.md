# Majestic Poker — Vercel + MongoDB

## 🚀 Деплой на Vercel

### 1. Установите зависимости
```bash
npm install
```

### 2. Настройте переменные окружения на Vercel

В панели Vercel → Project Settings → Environment Variables добавьте:

```
MONGODB_URI=mongodb+srv://Vercel-Admin-atlas-bole-anchor:WGqpKS4G9DooHQwh@atlas-bole-anchor.irfacsv.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=majestic-poker-secret-key-2024-change-in-production
```

### 3. Задеплойте
```bash
npx vercel deploy
```

Или через GitHub:
1. Запушите репозиторий на GitHub
2. В Vercel импортируйте проект из GitHub
3. Добавьте переменные окружения
4. Vercel автоматически задеплоит

---

## 📁 Структура

```
/
├── api/                    # Vercel serverless функции
│   ├── lib/
│   │   ├── db.js          # Подключение к MongoDB
│   │   └── auth.js        # JWT middleware
│   ├── models/
│   │   ├── User.js        # Модель пользователя
│   │   ├── Session.js     # Модель сессии
│   │   └── Analysis.js    # Модель анализа
│   ├── auth/
│   │   ├── register.js    # POST /api/auth/register
│   │   ├── login.js       # POST /api/auth/login
│   │   ├── me.js          # GET /api/auth/me
│   │   └── logout.js      # POST /api/auth/logout
│   ├── sessions/
│   │   ├── index.js       # GET, POST /api/sessions
│   │   └── [id].js        # DELETE /api/sessions/:id
│   ├── analyses/
│   │   ├── index.js       # GET, POST /api/analyses
│   │   └── [id].js        # DELETE /api/analyses/:id
│   └── subscriptions/
│       ├── activate.js    # POST /api/subscriptions/activate
│       └── cancel.js      # POST /api/subscriptions/cancel
├── js/
│   ├── api.js             # API клиент (браузер)
│   ├── storage.js         # Storage (без LocalStorage)
│   ├── auth.js            # Аутентификация
│   ├── app.js             # Основное приложение
│   └── poker-engine.js    # Покер движок
├── index.html             # Страница входа
├── app.html               # Основное приложение
├── .env                   # Локальные переменные (НЕ КОММИТИТЬ)
├── vercel.json            # Конфиг Vercel
└── package.json
```

---

## 🔐 Безопасность

- ✅ Пароли хэшируются через bcrypt
- ✅ JWT токены с expiration 30 дней
- ✅ 1 IP = 1 аккаунт (при регистрации)
- ✅ MongoDB URI только в .env на Vercel
- ✅ LocalStorage отключён (кроме токена сессии)

---

## 📡 API Endpoint'ы

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/register` | Регистрация (1 IP = 1 аккаунт) |
| POST | `/api/auth/login` | Вход |
| GET | `/api/auth/me` | Текущий пользователь |
| POST | `/api/auth/logout` | Выход |
| GET | `/api/sessions` | Список сессий |
| POST | `/api/sessions` | Создать сессию |
| DELETE | `/api/sessions/:id` | Удалить сессию |
| GET | `/api/analyses?sessionId=` | Анализы сессии |
| POST | `/api/analyses` | Создать анализ |
| DELETE | `/api/analyses/:id` | Удалить анализ |
| POST | `/api/subscriptions/activate` | Активировать Pro |
| POST | `/api/subscriptions/cancel` | Отменить подписку |

---

## 🧪 Локальная разработка

```bash
# Установите Vercel CLI
npm i -g vercel

# Запустите локально
npm run dev
# или
vercel dev
```

Локальный сервер: `http://localhost:3000`

---

## 🔑 Лицензионные ключи

Измените в `api/subscriptions/activate.js`:
```javascript
const VALID_KEYS = ['EKKL-812C-2DSL-L5VN', 'GCKL-241C-2DSL-L38N'];
```
