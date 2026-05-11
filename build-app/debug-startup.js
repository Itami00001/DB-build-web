const db = require('./app/models');

/**
 * Отладка запуска приложения
 */
async function debugStartup() {
  try {
    console.log("🔍 Отладка запуска приложения...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Проверяем состояние таблиц до sync
    console.log("📋 Состояние таблиц до sync:");
    const tablesBefore = await db.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name LIKE '%material%'
      ORDER BY table_name;
    `);
    
    tablesBefore[0].forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Проверяем количество записей до sync
    for (const table of tablesBefore[0]) {
      try {
        const count = await db.sequelize.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        console.log(`📊 ${table.table_name}: ${count[0][0].count} записей`);
      } catch (error) {
        console.log(`❌ Ошибка при проверке ${table.table_name}: ${error.message}`);
      }
    }
    
    // Выполняем sync как в server.js
    console.log("🔄 Выполняем sync как в server.js...");
    
    const models = [
      { name: 'user', model: db.user },
      { name: 'materialCategories', model: db.materialCategories },
      { name: 'material', model: db.material },
      { name: 'advertisement', model: db.advertisement },
      { name: 'transaction', model: db.transaction },
      { name: 'cart', model: db.cart },
      { name: 'order', model: db.order },
      { name: 'orderItem', model: db.orderItem },
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
    
    // Проверяем состояние таблиц после sync
    console.log("📋 Состояние таблиц после sync:");
    const tablesAfter = await db.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name LIKE '%material%'
      ORDER BY table_name;
    `);
    
    tablesAfter[0].forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Проверяем количество записей после sync
    for (const table of tablesAfter[0]) {
      try {
        const count = await db.sequelize.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        console.log(`📊 ${table.table_name}: ${count[0][0].count} записей`);
      } catch (error) {
        console.log(`❌ Ошибка при проверке ${table.table_name}: ${error.message}`);
      }
    }
    
    console.log("🎉 Отладка запуска приложения завершена!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при отладке запуска:", error);
    process.exit(1);
  }
}

debugStartup();
