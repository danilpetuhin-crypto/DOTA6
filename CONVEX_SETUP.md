# Настройка Convex для Majestic Poker

## Шаг 1: Установка Node.js

Скачайте и установите Node.js с [nodejs.org](https://nodejs.org)

## Шаг 2: Установка зависимостей

Откройте терминал в папке проекта и выполните:

```bash
npm install
```

## Шаг 3: Создание Convex проекта

1. Зайдите на [convex.dev](https://convex.dev)
2. Войдите через GitHub
3. Нажмите **"Create New Project"**
4. Назовите проект: `majestic-poker`

## Шаг 4: Локальная разработка

```bash
# Запуск Convex в режиме разработки
npx convex dev
```

При первом запуске:
- Convex попросит авторизоваться в браузере
- Выберите проект который создали
- Сгенерирует файлы в `convex/_generated/`
- Создаст схему данных

**Оставьте этот терминал запущенным** во время разработки.

## Шаг 5: Деплой Convex функций

В отдельном терминале выполните:

```bash
npx convex deploy
```

## Шаг 6: Настройка Vercel

1. Зайдите в **Vercel Dashboard** → ваш проект
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте переменные:

| Name | Value |
|------|-------|
| `CONVEX_URL` | `https://your-deployment.convex.cloud` |
| `JWT_SECRET` | `majestic-poker-secret-2024` |

**Где взять CONVEX_URL:**
- Convex Dashboard → Settings → Deployment URL
- Пример: `https://dashing-sockeye-401.convex.cloud`

## Шаг 7: Финальный деплой

```bash
# Пуш на GitHub (для Vercel)
git add .
git commit -m "migrate to Convex"
git push
```

Vercel автоматически начнёт деплой после пуша.

## Проверка работы

1. Откройте ваш сайт на Vercel
2. Попробуйте зарегистрироваться
3. Если успешно - всё работает!

## Структура проекта

```
├── convex/           # Convex функции
│   ├── schema.ts     # Схема данных
│   ├── auth.ts       # Аутентификация
│   ├── sessions.ts   # Сессии
│   ├── analyses.ts   # Анализы
│   └── http.ts       # HTTP API
├── api/              # Vercel функции
│   └── auth/         # endpoints
├── js/               # Frontend
└── index.html        # Страница входа
```

## Готово!

Теперь ваш проект работает на **Convex + Vercel**.
