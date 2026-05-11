const db = require('./app/models');

/**
 * Отладка подключения к базе данных
 */
async function debugConnection() {
  try {
    console.log("🔍 Отладка подключения к базе данных...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Проверяем конфигурацию подключения
    console.log("📋 Конфигурация Sequelize:");
    console.log(`- Database: ${db.sequelize.config.database}`);
    console.log(`- Host: ${db.sequelize.config.host}`);
    console.log(`- Port: ${db.sequelize.config.port}`);
    console.log(`- Dialect: ${db.sequelize.getDialect()}`);
    
    // Проверяем текущую базу данных
    const currentDb = await db.sequelize.query('SELECT current_database()');
    console.log(`📊 Текущая база данных: ${currentDb[0][0].current_database}`);
    
    // Проверяем все таблицы в текущей базе
    const allTables = await db.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name LIKE '%material%'
      ORDER BY table_name;
    `);
    
    console.log("📋 Таблицы в базе данных:");
    allTables[0].forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Проверяем количество записей в каждой таблице
    for (const table of allTables[0]) {
      try {
        const count = await db.sequelize.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        console.log(`📊 ${table.table_name}: ${count[0][0].count} записей`);
      } catch (error) {
        console.log(`❌ Ошибка при проверке ${table.table_name}: ${error.message}`);
      }
    }
    
    // Проверяем последние записи в materials
    try {
      const latestMaterials = await db.sequelize.query(`
        SELECT m.name, mc.name as category_name, m.created_at
        FROM materials m
        JOIN materialCategories mc ON m.category_id = mc.id
        ORDER BY m.created_at DESC
        LIMIT 5
      `);
      
      console.log("📋 Последние материалы в базе:");
      latestMaterials[0].forEach(mat => {
        console.log(`- ${mat.name} (${mat.category_name}) - ${mat.created_at}`);
      });
    } catch (error) {
      console.log(`❌ Ошибка при проверке последних материалов: ${error.message}`);
    }
    
    // Проверяем через модели Sequelize
    console.log("🔍 Проверка через модели Sequelize:");
    
    try {
      const sequelizeCategories = await db.materialCategories.findAll({
        order: [['sortOrder', 'ASC']]
      });
      
      const sequelizeMaterials = await db.material.findAll({
        include: [
          {
            model: db.materialCategories,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });
      
      console.log(`📊 Через Sequelize: ${sequelizeCategories.length} категорий, ${sequelizeMaterials.length} материалов`);
      
      sequelizeCategories.slice(0, 3).forEach(cat => {
        console.log(`- ${cat.name} (id: ${cat.id})`);
      });
      
      sequelizeMaterials.slice(0, 3).forEach(mat => {
        console.log(`- ${mat.name} (категория: ${mat.category.name})`);
      });
      
    } catch (error) {
      console.log(`❌ Ошибка при проверке через Sequelize: ${error.message}`);
    }
    
    console.log("🎉 Отладка подключения завершена!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при отладке:", error);
    process.exit(1);
  }
}

debugConnection();
