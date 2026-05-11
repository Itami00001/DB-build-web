const db = require('./app/models');

/**
 * Восстановление начальных данных для версии v1.4.1 (исправленная версия)
 */
async function restoreV141DataFixed() {
  try {
    console.log("🔄 Восстановление начальных данных для v1.4.1...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Очищаем базу данных
    await db.sequelize.drop();
    console.log("✅ База данных очищена");
    
    // Создаем таблицы в правильном порядке
    const models = [
      db.user,
      db.materialCategories,
      db.material,
      db.advertisement,
      db.order,
      db.orderItem,
      db.transaction,
      db.cart,
      db.review
    ];
    
    for (const model of models) {
      await model.sync({ force: true });
      console.log(`✅ Таблица ${model.name} создана`);
    }
    
    // Запускаем начальную загрузку данных
    const { seedInitialData } = require('./app/seeders/index');
    await seedInitialData();
    
    console.log("🎉 Начальные данные для v1.4.1 успешно восстановлены!");
    
    // Проверяем результат
    const userCount = await db.user.count();
    const categoryCount = await db.materialCategories.count();
    const materialCount = await db.material.count();
    const advertisementCount = await db.advertisement.count();
    
    console.log("📊 Результат:");
    console.log(`👥 Пользователей: ${userCount}`);
    console.log(`📂 Категорий: ${categoryCount}`);
    console.log(`🔨 Материалов: ${materialCount}`);
    console.log(`📢 Объявлений: ${advertisementCount}`);
    
    // Показываем пользователей
    const users = await db.user.findAll({
      attributes: ['id', 'username', 'email', 'role', 'cCoinBalance']
    });
    
    console.log("👥 Созданные пользователи:");
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.role} - баланс: ${user.cCoinBalance} C`);
    });
    
    // Показываем материалы
    const materials = await db.material.findAll({
      include: [
        {
          model: db.materialCategories,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      limit: 10
    });
    
    console.log("🔨 Первые 10 материалов:");
    materials.forEach(mat => {
      console.log(`- ${mat.name} (${mat.category.name}) - ${mat.price} ${mat.unit}`);
    });
    
    // Показываем объявления
    const advertisements = await db.advertisement.findAll({
      include: [
        {
          model: db.user,
          as: 'user',
          attributes: ['username']
        },
        {
          model: db.material,
          as: 'material',
          attributes: ['name']
        }
      ],
      limit: 5
    });
    
    console.log("📢 Первые 5 объявлений:");
    advertisements.forEach(ad => {
      console.log(`- ${ad.title} от ${ad.user.username} (${ad.material.name}) - ${ad.price} C`);
    });
    
    console.log("🔑 Данные для входа:");
    console.log("  admin / adminadmin");
    console.log("  user / userpassword");
    console.log("  seller / sellerpassword");
    console.log("  buyer / buyerpassword");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при восстановлении данных:", error);
    process.exit(1);
  }
}

restoreV141DataFixed();
