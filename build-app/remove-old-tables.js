const db = require('./app/models');

/**
 * Удаление старых таблиц и оставление только новых
 */
async function removeOldTables() {
  try {
    console.log("🔄 Удаление старых таблиц...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Удаляем старые таблицы
    await db.sequelize.query('DROP TABLE IF EXISTS materialCategories CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS material CASCADE;');
    console.log("✅ Старые таблицы удалены");
    
    // Проверяем, что осталось
    const remainingTables = await db.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name LIKE '%material%'
      ORDER BY table_name;
    `);
    
    console.log("📋 Оставшиеся таблицы:");
    remainingTables[0].forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Проверяем количество записей в оставшихся таблицах
    for (const table of remainingTables[0]) {
      try {
        const count = await db.sequelize.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        console.log(`📊 ${table.table_name}: ${count[0][0].count} записей`);
      } catch (error) {
        console.log(`❌ Ошибка при проверке ${table.table_name}: ${error.message}`);
      }
    }
    
    // Проверяем результат через модели
    const categories = await db.materialCategories.findAll({
      order: [['sortOrder', 'ASC']]
    });
    
    const materials = await db.material.findAll({
      include: [
        {
          model: db.materialCategories,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });
    
    console.log(`🎉 Результат через модели: ${categories.length} категорий, ${materials.length} материалов`);
    
    categories.forEach(cat => {
      console.log(`- ${cat.name} (id: ${cat.id})`);
    });
    
    materials.forEach(mat => {
      console.log(`- ${mat.name} (категория: ${mat.category.name})`);
    });
    
    console.log("🎉 Удаление старых таблиц завершено!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при удалении старых таблиц:", error);
    process.exit(1);
  }
}

removeOldTables();
