const db = require('./app/models');

/**
 * Отладка API - проверка прямого подключения к базе данных
 */
async function debugAPI() {
  try {
    console.log("🔍 Отладка API...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Проверяем таблицы
    const tables = await db.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%material%'
      ORDER BY table_name;
    `);
    
    console.log("📋 Найденные таблицы:");
    tables[0].forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Проверяем количество записей в таблицах
    const materialCount = await db.sequelize.query('SELECT COUNT(*) as count FROM materials');
    const categoryCount = await db.sequelize.query('SELECT COUNT(*) as count FROM materialCategories');
    
    console.log(`📊 Количество записей:`);
    console.log(`- materials: ${materialCount[0][0].count}`);
    console.log(`- materialCategories: ${categoryCount[0][0].count}`);
    
    // Проверяем последние записи
    const latestMaterials = await db.sequelize.query(`
      SELECT m.name, mc.name as category_name
      FROM materials m
      JOIN materialCategories mc ON m.category_id = mc.id
      ORDER BY m.created_at DESC
      LIMIT 5
    `);
    
    console.log("📋 Последние материалы:");
    latestMaterials[0].forEach(mat => {
      console.log(`- ${mat.name} (${mat.category_name})`);
    });
    
    // Проверяем через модели Sequelize
    console.log("🔍 Проверка через модели Sequelize:");
    
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
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при отладке:", error);
    process.exit(1);
  }
}

debugAPI();
