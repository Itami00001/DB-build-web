const db = require('./app/models');

/**
 * Обновление таблицы advertisements для работы с категориями вместо материалов
 */
async function updateAdvertisementsTable() {
  try {
    console.log("🔄 Обновление таблицы advertisements...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Удаляем существующую таблицу
    await db.sequelize.query('DROP TABLE IF EXISTS advertisements CASCADE');
    console.log("✅ Таблица advertisements удалена");
    
    // Создаем новую таблицу с categoryId
    await db.advertisement.sync({ force: true });
    console.log("✅ Новая таблица advertisements создана с categoryId");
    
    // Создаем тестовые объявления с категориями
    const users = await db.user.findAll({ limit: 2 });
    const categories = await db.materialCategories.findAll({ limit: 5 });
    
    console.log(`👥 Найдено пользователей: ${users.length}`);
    console.log(`📂 Найдено категорий: ${categories.length}`);
    
    if (users.length >= 2 && categories.length >= 5) {
      const advertisements = await db.advertisement.bulkCreate([
        {
          title: "Кирпич силикатный",
          description: "Качественный силикатный кирпич для строительства",
          categoryId: categories[0].id, // Кирпич
          userId: users[1].id, // seller
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
          title: "Стеновые блоки",
          description: "Газобетонные блоки для строительства стен",
          categoryId: categories[1].id, // Блоки
          userId: users[1].id, // seller
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
          title: "Цемент М500",
          description: "Высококачественный цемент М500 для строительных работ",
          categoryId: categories[3].id, // Цемент
          userId: users[1].id, // seller
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
          title: "Строительная арматура",
          description: "Арматура А500С для фундаментов и железобетонных конструкций",
          categoryId: categories[4].id, // Арматура
          userId: users[1].id, // seller
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
          title: "Краска водно-дисперсионная",
          description: "Качественная краска для внутренних и наружных работ",
          categoryId: categories[2].id, // Краски
          userId: users[1].id, // seller
          price: 280,
          quantity: 150,
          status: 'active',
          location: "Казань",
          images: [],
          contactInfo: {},
          views: 95,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      
      console.log(`✅ Создано ${advertisements.length} тестовых объявлений с категориями`);
    }
    
    // Проверяем результат
    const advertisementCount = await db.advertisement.count();
    console.log(`📊 Всего объявлений: ${advertisementCount}`);
    
    // Показываем объявления с категориями
    const testAdvertisements = await db.advertisement.findAll({
      include: [
        {
          model: db.user,
          as: 'user',
          attributes: ['username']
        },
        {
          model: db.materialCategories,
          as: 'category',
          attributes: ['name']
        }
      ],
      limit: 5
    });
    
    console.log("📢 Тестовые объявления с категориями:");
    testAdvertisements.forEach(ad => {
      console.log(`- ${ad.title} от ${ad.user.username} (${ad.category.name}) - ${ad.price} C`);
    });
    
    console.log("🎉 Таблица advertisements успешно обновлена для работы с категориями!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при обновлении таблицы:", error);
    process.exit(1);
  }
}

updateAdvertisementsTable();
