const db = require('./app/models');

/**
 * Создание тестовых объявлений с категориями
 */
async function createTestAdvertisements() {
  try {
    console.log("🔄 Создание тестовых объявлений...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Получаем пользователей и категории
    const users = await db.user.findAll({ limit: 2 });
    const categories = await db.materialCategories.findAll();
    
    console.log(`👥 Найдено пользователей: ${users.length}`);
    console.log(`📂 Найдено категорий: ${categories.length}`);
    
    if (users.length === 0 || categories.length === 0) {
      console.log("❌ Нет пользователей или категорий для создания объявлений");
      process.exit(1);
    }
    
    // Создаем тестовые объявления
    const advertisements = [
      {
        title: "Кирпич силикатный высокого качества",
        description: "Прочный силикатный кирпич для строительства стен и перегородок. Отличные теплоизоляционные свойства.",
        categoryId: categories[0].id, // Кирпич
        userId: users[0].id,
        price: 18.5,
        quantity: 5000,
        status: 'active',
        location: "Москва",
        images: [],
        contactInfo: {},
        views: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Газобетонные блоки D500",
        description: "Легкие и прочные газобетонные блоки для строительства домов. Идеальны для теплоизоляции.",
        categoryId: categories[1].id, // Блоки
        userId: users[0].id,
        price: 140,
        quantity: 300,
        status: 'active',
        location: "Санкт-Петербург",
        images: [],
        contactInfo: {},
        views: 85,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Цемент М500 ПЦ",
        description: "Высококачественный портландцемент М500 для всех видов строительных работ. Усиленная формула.",
        categoryId: categories[3].id, // Цемент
        userId: users[1].id,
        price: 4500,
        quantity: 50,
        status: 'active',
        location: "Новосибирск",
        images: [],
        contactInfo: {},
        views: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Строительная арматура А500С",
        description: "Стальная арматура класса А500С для фундаментов и железобетонных конструкций. Диаметр 12мм.",
        categoryId: categories[4].id, // Песок (используем как Арматура)
        userId: users[1].id,
        price: 48,
        quantity: 30,
        status: 'active',
        location: "Екатеринбург",
        images: [],
        contactInfo: {},
        views: 150,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Водно-дисперсионная краска",
        description: "Экологичная краска для внутренних и наружных работ. Быстрое высыхание, долгий срок службы.",
        categoryId: categories[2].id, // Краски
        userId: users[0].id,
        price: 280,
        quantity: 150,
        status: 'active',
        location: "Казань",
        images: [],
        contactInfo: {},
        views: 95,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Речной песок мытый",
        description: "Чистый мытый речной песок для строительных работ. Идеален для бетона и штукатурки.",
        categoryId: categories[4].id, // Песок
        userId: users[1].id,
        price: 450,
        quantity: 100,
        status: 'active',
        location: "Нижний Новгород",
        images: [],
        contactInfo: {},
        views: 110,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Создаем объявления
    const createdAds = await db.advertisement.bulkCreate(advertisements);
    
    console.log(`✅ Создано ${createdAds.length} тестовых объявлений`);
    
    // Показываем созданные объявления с категориями
    const resultAds = await db.advertisement.findAll({
      include: [
        {
          model: db.materialCategories,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: db.user,
          as: 'user',
          attributes: ['username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log("📢 Созданные объявления:");
    resultAds.forEach(ad => {
      console.log(`- ${ad.title} от ${ad.user.username} (${ad.category.name}) - ${ad.price} C`);
    });
    
    console.log("🎉 Тестовые объявления успешно созданы!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при создании объявлений:", error);
    process.exit(1);
  }
}

createTestAdvertisements();
