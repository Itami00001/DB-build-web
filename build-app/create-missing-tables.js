const db = require('./app/models');

/**
 * Создание недостающих таблиц в базе данных
 */
async function createMissingTables() {
  try {
    console.log("🔄 Создание недостающих таблиц...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Создаем таблицу reviews
    await db.review.sync({ force: true });
    console.log("✅ Таблица reviews создана");
    
    // Проверяем результат
    const reviewCount = await db.review.count();
    console.log(`📊 Отзывов в базе: ${reviewCount}`);
    
    // Создаем несколько тестовых отзывов
    if (reviewCount === 0) {
      const users = await db.user.findAll({ limit: 2 });
      const advertisements = await db.advertisement.findAll({ limit: 2 });
      
      if (users.length >= 2 && advertisements.length >= 2) {
        await db.review.bulkCreate([
          {
            userId: users[0].id,
            advertisementId: advertisements[0].id,
            targetUserId: advertisements[0].userId,
            rating: 5,
            title: 'Отличный товар',
            comment: 'Качественный материал, все соответствует описанию. Рекомендую!',
            isVerified: true,
            helpfulCount: 3,
            status: 'approved',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            userId: users[1].id,
            advertisementId: advertisements[1].id,
            targetUserId: advertisements[1].userId,
            rating: 4,
            title: 'Хорошо, но...',
            comment: 'Товар хороший, но доставка заняла больше времени, чем ожидалось.',
            isVerified: false,
            helpfulCount: 1,
            status: 'approved',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);
        
        console.log("✅ Создано 2 тестовых отзыва");
      }
    }
    
    // Показываем статистику
    const stats = {
      users: await db.user.count(),
      advertisements: await db.advertisement.count(),
      transactions: await db.transaction.count(),
      orders: await db.order.count(),
      materialCategories: await db.materialCategories.count(),
      materials: await db.material.count(),
      carts: await db.cart.count(),
      reviews: await db.review.count()
    };
    
    console.log("📊 Текущая статистика:");
    console.log(`- Пользователи: ${stats.users}`);
    console.log(`- Объявления: ${stats.advertisements}`);
    console.log(`- Транзакции: ${stats.transactions}`);
    console.log(`- Заказы: ${stats.orders}`);
    console.log(`- Категории: ${stats.materialCategories}`);
    console.log(`- Материалы: ${stats.materials}`);
    console.log(`- Корзины: ${stats.carts}`);
    console.log(`- Отзывы: ${stats.reviews}`);
    
    console.log("🎉 Недостающие таблицы успешно созданы!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при создании таблиц:", error);
    process.exit(1);
  }
}

createMissingTables();
