# Game Board Match - Backend API

Backend API для мобильного приложения поиска напарников в настольные игры. Приложение работает по аналогии с приложениями для знакомств, но фокусируется на поиске партнеров для игр.

## 🚀 Технологии

- **Node.js** - JavaScript runtime
- **TypeScript** - Статическая типизация
- **Express.js** - Web framework
- **MongoDB** - NoSQL база данных
- **Mongoose** - ODM для MongoDB
- **JWT** - Аутентификация
- **Joi** - Валидация данных
- **Socket.io** - Real-time коммуникация (готов к интеграции)

## 📋 Функциональность

### Пользователи
- Регистрация и авторизация
- Профиль с геолокацией
- Настройки предпочтений (игровые жанры, стиль игры, доступность)
- Поиск пользователей по геолокации и интересам
- Избранные игры

### Игры
- Каталог настольных игр
- Поиск и фильтрация игр
- Рейтинговая система
- Категории и механики игр

### Матчи
- Создание игровых встреч
- Поиск матчей по геолокации и параметрам
- Присоединение к матчам
- Чат для участников матча
- Управление матчами

## 🛠 Установка и запуск

### Предварительные требования
- Node.js (версия 16 или выше)
- MongoDB (локально или MongoDB Atlas)
- npm или yarn

### 1. Клонирование и установка зависимостей

```bash
# Установка зависимостей
npm install
```

### 2. Настройка окружения

Скопируйте файл `env.example` в `.env` и настройте переменные:

```bash
cp env.example .env
```

Отредактируйте `.env` файл:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/game-board-match

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Запуск приложения

```bash
# Режим разработки (с hot reload)
npm run dev

# Компиляция TypeScript
npm run build

# Продакшн режим
npm start

# Линтинг кода
npm run lint

# Исправление ошибок линтера
npm run lint:fix
```

Сервер будет доступен по адресу: `http://localhost:3000`

## 🔧 TypeScript конфигурация

Проект полностью написан на TypeScript с строгой типизацией:

- **tsconfig.json** - конфигурация TypeScript компилятора
- **ESLint** - линтер для TypeScript кода
- **Строгие типы** - все интерфейсы и типы определены в `src/types/`
- **Автокомплит** - полная поддержка IDE с автокомплитом

## 📚 API Документация

### Базовый URL
```
http://localhost:3000/api
```

### Аутентификация

#### POST /api/auth/register
Регистрация нового пользователя

**Тело запроса:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "age": 25,
  "bio": "Люблю настольные игры!",
  "location": {
    "coordinates": [37.7749, -122.4194],
    "address": "123 Main St, San Francisco, CA",
    "city": "San Francisco",
    "country": "USA"
  }
}
```

#### POST /api/auth/login
Вход в систему

**Тело запроса:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
Получение информации о текущем пользователе (требует токен)

### Пользователи

#### GET /api/users/nearby
Поиск пользователей поблизости

**Параметры запроса:**
- `latitude` - широта
- `longitude` - долгота
- `maxDistance` - максимальное расстояние в км (по умолчанию 50)
- `limit` - количество результатов (по умолчанию 20)

#### GET /api/users/search
Расширенный поиск пользователей

**Параметры запроса:**
- `query` - текстовый поиск
- `gameTypes` - типы игр (через запятую)
- `playStyle` - стиль игры (casual, competitive, mixed)
- `ageMin`, `ageMax` - возрастной диапазон
- `maxDistance` - максимальное расстояние
- `latitude`, `longitude` - координаты для поиска
- `page`, `limit` - пагинация

### Игры

#### GET /api/games
Получение списка игр

**Параметры запроса:**
- `search` - текстовый поиск
- `categories` - категории (через запятую)
- `mechanics` - механики (через запятую)
- `minPlayers`, `maxPlayers` - количество игроков
- `complexity` - сложность (1-5)
- `minRating` - минимальный рейтинг
- `sortBy` - сортировка (name, rating, year, complexity, popularity)
- `sortOrder` - порядок сортировки (asc, desc)
- `page`, `limit` - пагинация

#### GET /api/games/:id
Получение информации об игре

#### POST /api/games/:id/rate
Оценка игры (требует токен)

**Тело запроса:**
```json
{
  "rating": 8.5
}
```

### Матчи

#### GET /api/matches
Поиск матчей

**Параметры запроса:**
- `game` - ID игры
- `latitude`, `longitude` - координаты
- `maxDistance` - максимальное расстояние в км
- `dateFrom`, `dateTo` - диапазон дат
- `maxPlayers` - максимальное количество игроков
- `experience` - требуемый опыт (beginner, intermediate, advanced, any)
- `tags` - теги (через запятую)
- `page`, `limit` - пагинация

#### POST /api/matches
Создание нового матча (требует токен)

**Тело запроса:**
```json
{
  "game": "60f7b3b3b3b3b3b3b3b3b3b3",
  "title": "Играем в Catan",
  "description": "Приглашаю поиграть в Catan в субботу",
  "location": {
    "coordinates": [37.7749, -122.4194],
    "address": "123 Main St, San Francisco, CA",
    "venue": "My Home",
    "city": "San Francisco"
  },
  "scheduledDate": "2024-01-20T18:00:00.000Z",
  "duration": 120,
  "maxPlayers": 4,
  "requirements": {
    "experience": "any",
    "ageMin": 18,
    "notes": "Приносите закуски!"
  },
  "tags": ["strategy", "family"]
}
```

#### POST /api/matches/:id/join
Присоединение к матчу (требует токен)

#### POST /api/matches/:id/leave
Покидание матча (требует токен)

#### GET /api/matches/my-matches
Получение матчей пользователя (требует токен)

## 🔧 Структура проекта

```
src/
├── config/          # Конфигурация базы данных
├── controllers/     # Контроллеры API (TypeScript)
├── middleware/      # Промежуточное ПО (TypeScript)
├── models/          # Модели данных MongoDB (TypeScript)
├── routes/          # Маршруты API (TypeScript)
├── services/        # Бизнес-логика
├── types/           # TypeScript типы и интерфейсы
├── utils/           # Утилиты
├── server.ts        # Главный файл сервера (TypeScript)
└── dist/            # Скомпилированный JavaScript (автогенерируется)
```

## 🗄 Модели данных

### User
- Основная информация пользователя
- Геолокация (координаты, адрес)
- Предпочтения (игровые жанры, стиль игры, доступность)
- Избранные игры

### Game
- Информация о настольных играх
- Категории, механики, сложность
- Рейтинговая система
- Изображения и описания

### Match
- Игровые встречи
- Геолокация и время проведения
- Участники и хост
- Чат и требования

## 🔒 Безопасность

- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- Rate limiting для защиты от спама
- Валидация всех входящих данных
- CORS настройки
- Helmet для безопасности HTTP заголовков

## 🚀 Развертывание

### Heroku
1. Создайте приложение на Heroku
2. Добавьте MongoDB Atlas как аддон
3. Настройте переменные окружения
4. Деплойте код

### Docker
```dockerfile
# Dockerfile будет добавлен в будущих версиях
```

## 📝 TODO

- [x] Переписать весь проект на TypeScript
- [x] Настроить строгую типизацию
- [x] Добавить ESLint для TypeScript
- [ ] Добавить Socket.io для real-time чата
- [ ] Интеграция с email сервисом для уведомлений
- [ ] Push уведомления
- [ ] Система рейтингов пользователей
- [ ] Расширенная система тегов
- [ ] API для мобильного приложения
- [ ] Тесты (Jest + TypeScript)
- [ ] Логирование (Winston)
- [ ] Мониторинг (PM2)

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте issue в репозитории.
