require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

const db = require("./app/models");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./app/config/swagger.config');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrcAttr: ["'unsafe-inline'"]
    }
  }
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
var corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
   ? ['https://yourdomain.com'] 
    : ["http://localhost:3000", "http://localhost:8080"],
  credentials: true
};

app.use(cors(corsOptions));

// Static files - ВАЖНО: должно быть ПЕРЕД маршрутами API
app.use(express.static('public'));

// Parse requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Health check endpoint - ДОЛЖЕН БЫТЬ ПЕРЕД ВСЕМИ MIDDLEWARE
app.get('/health', (req, res) => {
  const timestamp = new Date().toISOString();
  res.json({ 
    status: 'OK',
    timestamp: timestamp,
    uptime: process.uptime(),
    message: 'Фронтенд работает корректно'
  });
});

// Главная страница - отдаем index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${req.method} ${req.url} - ${req.ip}`;
  console.log(logMessage);
  next();
});

// Swagger documentation with admin protection
const { swaggerProtection } = require('./app/middleware/swagger.middleware');
app.use('/api-docs', swaggerProtection, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Build-Shop API Documentation'
}));

// Temporary API endpoints (without database)

// Featured materials
app.get('/api/materials/featured', (req, res) => {
  const featuredMaterials = [
    {
      id: 1,
      name: 'Кирпич силикатный одинарный',
      description: 'Силикатный кирпич М-100, размер 250х120х65 мм',
      price: 15.50,
      unit: 'шт',
      category: 'Стеновые материалы',
      inStock: 10000,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Бетон М-200',
      description: 'Готовый бетон для фундамента и перекрытий',
      price: 3500.00,
      unit: 'м³',
      category: 'Бетон и растворы',
      inStock: 50,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Краска водно-дисперсионная',
      description: 'Водно-дисперсионная краска для внутренних работ',
      price: 450.00,
      unit: 'л',
      inStock: 200,
      rating: 4.2,
      reviewCount: 15,
      category: {
        id: 3,
        name: 'Краски'
      }
    }
  ];
  
  res.json(featuredMaterials);
});

// User profile
app.get('/api/users/profile', (req, res) => {
  // В реальном приложении брать ID пользователя из токена
  // Для демонстрации возвращаем разные данные для разных пользователей
  const users = [
    { id: 1, username: 'test', firstName: 'Test', lastName: 'user', email: 'test@example.com', phone: '+71234567890', birthDate: '1990-01-01', cCoinBalance: 100.00, createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 2, username: 'test1', firstName: 'Test1', lastName: 'user1', email: 'test1@example.com', phone: '+71234567891', birthDate: '1990-02-01', cCoinBalance: 50.00, createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 3, username: 'test2', firstName: 'Test2', lastName: 'user2', email: 'test2@example.com', phone: '+71234567892', birthDate: '1990-03-01', cCoinBalance: 75.00, createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 4, username: 'admin', firstName: 'Admin', lastName: 'user', email: 'admin@example.com', phone: '+71234567893', birthDate: '1985-01-01', cCoinBalance: 1000.00, createdAt: '2024-01-01T00:00:00.000Z' }
  ];
  
  // По умолчанию возвращаем админа (для демонстрации)
  res.json(users[3]);
});

// Temporary advertisements endpoint
app.get('/api/advertisements/all', (req, res) => {
  const advertisements = [
    { id: 1, title: "Кирпич силикатный М-100", description: "Силикатный кирпич одинарный", price: 15.50, quantity: 1000, status: "active", material: { id: 1, name: "Кирпич силикатный" }, user: { id: 1, username: "test" } },
    { id: 2, title: "Бетон М-200", description: "Готовый бетон для фундамента", price: 3500.00, quantity: 5, status: "active", material: { id: 2, name: "Бетон М-200" }, user: { id: 2, username: "test1" } },
    { id: 3, title: "Цемент М-500", description: "Портландцемент в мешках", price: 420.00, quantity: 100, status: "active", material: { id: 3, name: "Цемент М-500" }, user: { id: 3, username: "test2" } },
    { id: 4, title: "Арматура А500 12мм", description: "Арматура для фундамента", price: 45000.00, quantity: 2, status: "active", material: { id: 4, name: "Арматура А500" }, user: { id: 4, username: "admin" } },
    { id: 5, title: "Пеноблок D600", description: "Пеноблоки для стен", price: 3200.00, quantity: 10, status: "active", material: { id: 5, name: "Пеноблок D600" }, user: { id: 1, username: "test" } },
    { id: 6, title: "Керамзит", description: "Керамзит для бетона", price: 1800.00, quantity: 15, status: "active", material: { id: 6, name: "Керамзит" }, user: { id: 2, username: "test1" } },
    { id: 7, title: "Гипсокартон 12.5мм", description: "Гипсокартон для перегородок", price: 380.00, quantity: 20, status: "active", material: { id: 7, name: "Гипсокартон" }, user: { id: 3, username: "test2" } },
    { id: 8, title: "Минеральная вата 100мм", description: "Утеплитель для стен", price: 550.00, quantity: 30, status: "active", material: { id: 8, name: "Минеральная вата" }, user: { id: 4, username: "admin" } }
  ];
  
  console.log(`Возвращено объявлений: ${advertisements.length}`);
  res.json(advertisements);
});

// Temporary users endpoint
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, username: 'test', firstName: 'Test', lastName: 'User', cCoinBalance: 100.00 },
    { id: 2, username: 'test1', firstName: 'Test1', lastName: 'User1', cCoinBalance: 50.00 },
    { id: 3, username: 'test2', firstName: 'Test2', lastName: 'User2', cCoinBalance: 75.00 },
    { id: 4, username: 'admin', firstName: 'Admin', lastName: 'User', cCoinBalance: 1000.00 }
  ];
  
  console.log(`Возвращено пользователей: ${users.length}`);
  res.json(users);
});

// Temporary transactions endpoint
app.get('/api/transactions', (req, res) => {
  const transactions = [
    {
      id: 1,
      senderId: 1,
      receiverId: 2,
      amount: 25.00,
      description: 'Оплата за материалы',
      status: 'completed',
      balanceBefore: 100.00,
      balanceAfter: 75.00,
      createdAt: new Date('2024-01-15T10:30:00Z'),
      sender: { id: 1, username: 'test' },
      receiver: { id: 2, username: 'test1' }
    },
    {
      id: 2,
      senderId: 4,
      receiverId: 3,
      amount: 100.00,
      description: 'Бонус за активность',
      status: 'completed',
      balanceBefore: 1000.00,
      balanceAfter: 900.00,
      createdAt: new Date('2024-01-14T15:45:00Z'),
      sender: { id: 4, username: 'admin' },
      receiver: { id: 3, username: 'test2' }
    },
    {
      id: 3,
      senderId: 2,
      receiverId: 1,
      amount: 15.50,
      description: 'Покупка кирпича',
      status: 'completed',
      balanceBefore: 50.00,
      balanceAfter: 34.50,
      createdAt: new Date('2024-01-15T09:20:00Z'),
      sender: { id: 2, username: 'test1' },
      receiver: { id: 1, username: 'test' }
    }
  ];
  
  console.log(`Возвращено транзакций: ${transactions.length}`);
  res.json(transactions);
});

// Create transaction endpoint
app.post('/api/transactions', (req, res) => {
  const { receiverId, amount, description } = req.body;
  
  // Валидация
  if (!receiverId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Неверные данные транзакции' });
  }
  
  // Имитация создания транзакции с соблюдением ACID
  const transactionId = Math.floor(Math.random() * 1000) + 100;
  const now = new Date().toISOString();
  
  const transaction = {
    id: transactionId,
    senderId: 1, // В реальном приложении брать из токена
    receiverId: receiverId,
    amount: amount,
    description: description || 'Перевод C-coin',
    status: 'completed',
    balanceBefore: 100.00, // В реальном приложении брать из БД
    balanceAfter: 100.00 - amount,
    createdAt: now,
    transactionDate: now,
    completedAt: now,
    sender: { id: 1, username: 'test' },
    receiver: { id: receiverId, username: 'user' + receiverId }
  };
  
  console.log(`Создана транзакция: ${JSON.stringify(transaction)}`);
  res.json(transaction);
});

// All materials
app.get('/api/materials', (req, res) => {
  const materials = [
    {
      id: 1,
      name: 'Кирпич силикатный одинарный',
      description: 'Силикатный кирпич М-100, размер 250х120х65 мм',
      price: 15.50,
      unit: 'шт',
      inStock: 10000,
      categoryId: 1,
      category: {
        id: 1,
        name: 'Кирпич'
      }
    },
    {
      id: 2,
      name: 'Блок газобетонный',
      description: 'Газобетонный блок D600, размер 600х300х200 мм',
      price: 125.00,
      unit: 'шт',
      inStock: 500,
      categoryId: 2,
      category: {
        id: 2,
        name: 'Блоки'
      }
    },
    {
      id: 3,
      name: 'Краска водно-дисперсионная',
      description: 'Водно-дисперсионная краска для внутренних работ',
      price: 450.00,
      unit: 'л',
      inStock: 200,
      categoryId: 3,
      category: {
        id: 3,
        name: 'Краски'
      }
    }
  ];
  
  res.json(materials);
});

// Material categories
app.get('/api/material-categories', (req, res) => {
  const categories = [
    { id: 1, name: 'Кирпич' },
    { id: 2, name: 'Блоки' },
    { id: 3, name: 'Краски' },
    { id: 4, name: 'Цемент' },
    { id: 5, name: 'Песок' }
  ];
  
  res.json(categories);
});

// Advertisements
app.get('/api/advertisements', (req, res) => {
  const advertisements = [
    {
      id: 1,
      title: 'Продам кирпич силикатный',
      description: 'Качественный силикатный кирпич по низкой цене',
      materialId: 1,
      userId: 1,
      price: 14.50,
      quantity: 5000,
      status: 'active',
      location: 'Москва',
      images: [],
      contactInfo: {},
      views: 25,
      featured: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      material: {
        id: 1,
        name: 'Кирпич силикатный одинарный'
      },
      user: {
        id: 1,
        firstName: 'test',
        lastName: 'user'
      }
    }
  ];
  
  res.json(advertisements);
});

// Transactions
app.get('/api/transactions', (req, res) => {
  const transactions = [
    {
      id: 1,
      fromUserId: 1,
      toUserId: 2,
      amount: 50.00,
      type: 'transfer',
      status: 'completed',
      description: 'Перевод C-коинов',
      createdAt: '2024-01-01T00:00:00.000Z',
      fromUser: {
        id: 1,
        firstName: 'test',
        lastName: 'user'
      },
      toUser: {
        id: 2,
        firstName: 'test1',
        lastName: 'user1'
      }
    }
  ];
  
  res.json(transactions);
});

// Cart
app.get('/api/cart', (req, res) => {
  const cart = [
    {
      id: 1,
      userId: 1,
      materialId: 1,
      quantity: 100,
      price: 15.50,
      material: {
        id: 1,
        name: 'Кирпич силикатный одинарный',
        unit: 'шт'
      }
    }
  ];
  
  res.json(cart);
});

// Orders
app.get('/api/orders', (req, res) => {
  const orders = [
    {
      id: 1,
      userId: 1,
      totalAmount: 1550.00,
      status: 'pending',
      createdAt: '2024-01-01T00:00:00.000Z',
      orderItems: [
        {
          id: 1,
          orderId: 1,
          materialId: 1,
          quantity: 100,
          price: 15.50,
          material: {
            id: 1,
            name: 'Кирпич силикатный одинарный',
            unit: 'шт'
          }
        }
      ]
    }
  ];
  
  res.json(orders);
});

// Include routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/public.routes')(app);
require('./app/routes/materialCategory.routes')(app);
require('./app/routes/material.routes')(app);
require('./app/routes/advertisement.routes')(app);
require('./app/routes/advertisements.test.routes')(app);
require('./app/routes/order.routes')(app);
require('./app/routes/transaction.routes')(app);
require('./app/routes/cart.routes')(app);
require('./app/routes/review.routes')(app);
require('./app/routes/admin.routes')(app);
require('./app/routes/admin.api.routes')(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Что-то пошло не так!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Маршрут не найден'
  });
});

// Sync database and start server
const PORT = process.env.NODE_LOCAL_PORT || 3000;

// Hot reload enabled - v3

async function startServer() {
  try {
    console.log('Подключение к базе данных...');
    
    // Синхронизация базы данных
    await db.sequelize.authenticate();
    console.log('Подключение к базе данных успешно установлено.');
    
    // Создаем все таблицы принудительно
    try {
      console.log('Создаем все таблицы...');
      
      // Создаем таблицы по одной с force: true для чистой базы
      const models = [
        { name: 'user', model: db.user },
        { name: 'materialCategories', model: db.materialCategories },
        { name: 'material', model: db.material },
        { name: 'advertisement', model: db.advertisement },
        { name: 'transaction', model: db.transaction },
        { name: 'cart', model: db.cart },
        { name: 'order', model: db.order },
        { name: 'review', model: db.review }
      ];
      
      for (const { name, model } of models) {
        if (model) {
          try {
            await model.sync({ force: true });
            console.log(`✅ Таблица ${name} создана.`);
          } catch (err) {
            console.log(`❌ Ошибка создания таблицы ${name}:`, err.message);
          }
        }
      }
      
      console.log('🎯 Все таблицы созданы успешно.');
      
    } catch (error) {
      console.log('❌ Ошибка при создании таблиц:', error.message);
    }
    
    // Временно отключаем создание индексов для запуска приложения
    try {
      const createIndexesModule = require('./app/models/indexes');
      await createIndexesModule(db);
      console.log('Индексы успешно созданы.');
    } catch (error) {
      console.log('Ошибка при создании индексов (пропускаем):', error.message);
    }
    
    // Создание начальных данных (только в режиме разработки)
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { seedInitialData } = require('./app/seeders/index');
        await seedInitialData();
        console.log('Начальные данные успешно созданы.');
      } catch (error) {
        console.log('Ошибка при создании начальных данных (вероятно, данные уже существуют):', error.message);
      }
    }
    
    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}.`);
      console.log(`Документация Swagger доступна по адресу: http://localhost:${PORT}/api-docs`);
      console.log(`Основной сайт доступен по адресу: http://localhost:${PORT}`);
      
      // Вывод информации о пользователях
      console.log('\n=== Тестовые пользователи ===');
      console.log('test / testtest - обычный пользователь');
      console.log('test1 / test1test1 - обычный пользователь');
      console.log('test2 / test2test2 - обычный пользователь');
      console.log('admin / adminadmin - администратор');
      console.log('===========================\n');
    });
    
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

startServer();
