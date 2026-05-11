const db = require('./app/models');

/**
 * Проверка состояния базы данных
 */
async function checkDatabase() {
  try {
    console.log("🔍 Проверка состояния базы данных...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Проверяем все таблицы в базе
    const allTables = await db.sequelize.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log("📋 Все таблицы в базе данных:");
    allTables[0].forEach(table => {
      console.log(`- ${table.table_name} (${table.table_type})`);
    });
    
    // Проверяем таблицы с materials в названии
    const materialTables = await db.sequelize.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name LIKE '%material%'
      ORDER BY table_name;
    `);
    
    console.log("📋 Таблицы с 'material' в названии:");
    materialTables[0].forEach(table => {
      console.log(`- ${table.table_name} (${table.table_type})`);
    });
    
    // Проверяем количество записей в каждой таблице
    for (const table of materialTables[0]) {
      try {
        const count = await db.sequelize.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        console.log(`📊 ${table.table_name}: ${count[0][0].count} записей`);
      } catch (error) {
        console.log(`❌ Ошибка при проверке ${table.table_name}: ${error.message}`);
      }
    }
    
    // Проверяем структуру таблицы materials
    try {
      const structure = await db.sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'materials'
        ORDER BY ordinal_position;
      `);
      
      console.log("📋 Структура таблицы 'materials':");
      structure[0].forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
      });
    } catch (error) {
      console.log(`❌ Ошибка при проверке структуры 'materials': ${error.message}`);
    }
    
    // Проверяем конфигурацию Sequelize
    console.log("🔍 Конфигурация Sequelize:");
    console.log(`- Dialect: ${db.sequelize.getDialect()}`);
    console.log(`- Database: ${db.sequelize.config.database}`);
    console.log(`- Host: ${db.sequelize.config.host}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при проверке базы данных:", error);
    process.exit(1);
  }
}

checkDatabase();
