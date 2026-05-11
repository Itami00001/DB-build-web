const db = require('./app/models');

/**
 * Восстановление начальных данных для версии v1.4.1
 */
async function restoreV141Data() {
  try {
    console.log("🔄 Восстановление начальных данных для v1.4.1...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Синхронизируем модели с базой данных
    await db.sequelize.sync({ force: true });
    console.log("✅ Модели синхронизированы");
    
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
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при восстановлении данных:", error);
    process.exit(1);
  }
}

restoreV141Data();
