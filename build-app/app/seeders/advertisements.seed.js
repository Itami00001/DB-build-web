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

    // Получаем существующие материалы
    const materials = await db.material.findAll();
    if (materials.length === 0) {
      console.log("❌ Нет материалов для создания объявлений");
      return;
    }

    const advertisements = [
      {
        userId: users[0].id, // test пользователь
        materialId: materials[0].id,
        title: "Кирпич силикатный М-100",
        name: "Кирпич силикатный М-100",
        description: "Силикатный кирпич одинарный, идеальный для строительства стен. Отличное качество, соответствует ГОСТ. Продаю излишки после завершения строительства.",
        price: 15.50,
        quantity: 1000,
        unit: "шт",
        minOrder: 100,
        inStock: 1000,
        isActive: true,
        status: "active"
      },
      {
        userId: users[1].id, // test1 пользователь
        materialId: materials[1].id,
        title: "Бетон М-200",
        name: "Бетон М-200",
        description: "Готовый бетон М-200 для фундамента и перекрытий. Можно заказать с доставкой на объект. Качество гарантировано.",
        price: 3500.00,
        quantity: 5,
        unit: "м³",
        minOrder: 1,
        inStock: 5,
        isActive: true,
        status: "active"
      },
      {
        userId: users[2].id, // test2 пользователь
        materialId: materials[2].id,
        title: "Цемент М-500",
        name: "Цемент М-500",
        description: "Портландцемент М-500 Д0 в мешках по 50 кг. Свежий, со склада. Идеален для высокопрочного бетона.",
        price: 420.00,
        quantity: 100,
        unit: "меш",
        minOrder: 10,
        inStock: 100,
        isActive: true,
        status: "active"
      },
      {
        userId: users[3].id, // admin пользователь
        materialId: materials[3].id,
        title: "Арматура А500 12мм",
        name: "Арматура А500 12мм",
        description: "Арматура диаметром 12мм класса А500. Длина 11.7м. Идеально для армирования фундамента и перекрытий.",
        price: 45000.00,
        quantity: 2,
        unit: "т",
        minOrder: 1,
        inStock: 2,
        isActive: true,
        status: "active"
      },
      {
        userId: users[0].id, // test пользователь
        materialId: materials[4].id,
        title: "Пеноблок D600",
        name: "Пеноблок D600",
        description: "Пеноблоки D600 размером 600x300x200 мм. Легкие, теплые, прочные. Отлично подходят для строительства стен.",
        price: 3200.00,
        quantity: 10,
        unit: "м³",
        minOrder: 2,
        inStock: 10,
        isActive: true,
        status: "active"
      },
      {
        userId: users[1].id, // test1 пользователь
        materialId: materials[5].id,
        title: "Керамзит",
        name: "Керамзит",
        description: "Керамзит фракция 5-10 мм для легкого бетона и теплоизоляции. Чистый, без примесей.",
        price: 1800.00,
        quantity: 15,
        unit: "м³",
        minOrder: 3,
        inStock: 15,
        isActive: true,
        status: "active"
      },
      {
        userId: users[2].id, // test2 пользователь
        materialId: materials[6].id,
        title: "Гипсокартон 12.5мм",
        name: "Гипсокартон 12.5мм",
        description: "Гипсокартон Кнауф 12.5мм стандартный. Для перегородок и потолков. Упаковки по 50 листов.",
        price: 380.00,
        quantity: 20,
        unit: "лист",
        minOrder: 10,
        inStock: 20,
        isActive: true,
        status: "active"
      },
      {
        userId: users[3].id, // admin пользователь
        materialId: materials[7].id,
        title: "Минеральная вата 100мм",
        name: "Минеральная вата 100мм",
        description: "Минеральная вата Rockwool толщиной 100мм. Для утепления стен и перекрытий. Негорючая.",
        price: 550.00,
        quantity: 30,
        unit: "м²",
        minOrder: 5,
        inStock: 30,
        isActive: true,
        status: "active"
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
