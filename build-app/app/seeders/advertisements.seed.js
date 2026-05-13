const db = require("../models");

// Создать тестовые объявления
async function seedAdvertisements() {
  try {
    console.log("🌱 Создание тестовых объявлений...");

    // Получаем существующих пользователей
    const users = await db.user.findAll();
    if (users.length === 0) {
      console.log("❌ Нет пользователей для создания объявлений");
      return;
    }

    // Получаем существующие категории материалов
    const categories = await db.materialCategories.findAll();
    if (categories.length === 0) {
      console.log("❌ Нет категорий материалов для создания объявлений");
      return;
    }

    const advertisements = [
      {
        userId: users[0].id, // test пользователь
        categoryId: categories[0].id, // Стеновые материалы
        title: "Кирпич силикатный М-100",
        description: "Силикатный кирпич одинарный, идеальный для строительства стен. Отличное качество, соответствует ГОСТ. Продаю излишки после завершения строительства.",
        price: 15.50,
        quantity: 1000,
        status: "active",
        location: "Москва",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[1].id, // test1 пользователь
        categoryId: categories[4].id, // Фундаментные материалы
        title: "Бетон М-200",
        description: "Готовый бетон М-200 для фундамента и перекрытий. Можно заказать с доставкой на объект. Качество гарантировано.",
        price: 3500.00,
        quantity: 5,
        status: "active",
        location: "Санкт-Петербург",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[2].id, // test2 пользователь
        categoryId: categories[4].id, // Фундаментные материалы
        title: "Цемент М-500",
        description: "Портландцемент М-500 Д0 в мешках по 50 кг. Свежий, со склада. Идеален для высокопрочного бетона.",
        price: 420.00,
        quantity: 100,
        status: "active",
        location: "Казань",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[3].id, // admin пользователь
        categoryId: categories[4].id, // Фундаментные материалы
        title: "Арматура А500 12мм",
        description: "Арматура диаметром 12мм класса А500. Длина 11.7м. Идеально для армирования фундамента и перекрытий.",
        price: 45000.00,
        quantity: 2,
        status: "active",
        location: "Новосибирск",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[0].id, // test пользователь
        categoryId: categories[0].id, // Стеновые материалы
        title: "Пеноблок D600",
        description: "Пеноблоки D600 размером 600x300x200 мм. Легкие, теплые, прочные. Отлично подходят для строительства стен.",
        price: 3200.00,
        quantity: 10,
        status: "active",
        location: "Екатеринбург",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[1].id, // test1 пользователь
        categoryId: categories[5].id, // Изоляционные материалы
        title: "Керамзит",
        description: "Керамзит фракция 5-10 мм для легкого бетона и теплоизоляции. Чистый, без примесей.",
        price: 1800.00,
        quantity: 15,
        status: "active",
        location: "Нижний Новгород",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[2].id, // test2 пользователь
        categoryId: categories[2].id, // Отделочные материалы
        title: "Гипсокартон 12.5мм",
        description: "Гипсокартон Кнауф 12.5мм стандартный. Для перегородок и потолков. Упаковки по 50 листов.",
        price: 380.00,
        quantity: 20,
        status: "active",
        location: "Самара",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[3].id, // admin пользователь
        categoryId: categories[5].id, // Изоляционные материалы
        title: "Минеральная вата 100мм",
        description: "Минеральная вата Rockwool толщиной 100мм. Для утепления стен и перекрытий. Негорючая.",
        price: 550.00,
        quantity: 30,
        status: "active",
        location: "Омск",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];

    // Создаем объявления
    const createdAds = await db.advertisement.bulkCreate(advertisements);
    
    console.log(`✅ Создано ${createdAds.length} тестовых объявлений`);
    return createdAds;

  } catch (error) {
    console.error("❌ Ошибка при создании объявлений:", error);
    throw error;
  }
}

module.exports = { seedAdvertisements };
