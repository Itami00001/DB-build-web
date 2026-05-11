const db = require('./app/models');

/**
 * Принудительное создание таблиц через SQL и заполнение данными
 */
async function forceSQLCreate() {
  try {
    console.log("🔄 Принудительное создание таблиц через SQL...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Удаляем таблицы
    await db.sequelize.query('DROP TABLE IF EXISTS materials CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS materialCategories CASCADE;');
    console.log("✅ Старые таблицы удалены");
    
    // Создаем таблицы через SQL с правильными именами
    await db.sequelize.query(`
      CREATE TABLE materialCategories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parent_category_id INTEGER REFERENCES materialCategories(id),
        level INTEGER NOT NULL DEFAULT 1,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Таблица materialCategories создана");
    
    await db.sequelize.query(`
      CREATE TABLE materials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER NOT NULL REFERENCES materialCategories(id),
        price DECIMAL(10,2) NOT NULL,
        unit VARCHAR(50) NOT NULL DEFAULT 'шт',
        in_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
        min_order DECIMAL(10,2) NOT NULL DEFAULT 1,
        image VARCHAR(255),
        specifications JSON DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        rating DECIMAL(3,2) NOT NULL DEFAULT 0,
        review_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Таблица materials создана");
    
    // Вставляем категории
    await db.sequelize.query(`
      INSERT INTO materialCategories (name, description, level, is_active, sort_order, created_at, updated_at) VALUES
      ('Кирпич', 'Все виды кирпича', 1, true, 1, NOW(), NOW()),
      ('Блоки', 'Стеновые блоки', 1, true, 2, NOW(), NOW()),
      ('Краски', 'Краски и лакокрасочные материалы', 1, true, 3, NOW(), NOW()),
      ('Цемент', 'Цемент и сухие смеси', 1, true, 4, NOW(), NOW()),
      ('Песок', 'Песок и щебень', 1, true, 5, NOW(), NOW()),
      ('Арматура', 'Арматура и металлопрокат', 1, true, 6, NOW(), NOW()),
      ('Утеплитель', 'Теплоизоляционные материалы', 1, true, 7, NOW(), NOW()),
      ('Гидроизоляция', 'Гидроизоляционные материалы', 1, true, 8, NOW(), NOW()),
      ('Кровля', 'Кровельные материалы', 1, true, 9, NOW(), NOW()),
      ('Инструменты', 'Строительные инструменты', 1, true, 10, NOW(), NOW())
    `);
    console.log("✅ Создано 10 категорий");
    
    // Вставляем материалы
    await db.sequelize.query(`
      INSERT INTO materials (name, description, category_id, price, unit, in_stock, min_order, is_active, rating, review_count, created_at, updated_at) VALUES
      ('Кирпич', 'Строительный кирпич', 1, 15.5, 'шт', 10000, 100, true, 4.5, 23, NOW(), NOW()),
      ('Блоки', 'Стеновые блоки', 2, 125, 'шт', 500, 10, true, 4.7, 15, NOW(), NOW()),
      ('Краски', 'Лакокрасочные материалы', 3, 280, 'л', 150, 5, true, 4.4, 19, NOW(), NOW()),
      ('Цемент', 'Цемент и сухие смеси', 4, 4200, 'т', 80, 1, true, 4.7, 31, NOW(), NOW()),
      ('Песок', 'Песок и щебень', 5, 450, 'м³', 50, 5, true, 4.3, 16, NOW(), NOW()),
      ('Арматура', 'Стальная арматура', 6, 45, 'т', 50, 0.5, true, 4.3, 31, NOW(), NOW()),
      ('Утеплитель', 'Теплоизоляционные материалы', 7, 850, 'м³', 30, 1, true, 4.8, 24, NOW(), NOW()),
      ('Гидроизоляция', 'Гидроизоляционные материалы', 8, 280, 'м²', 500, 15, true, 4.5, 20, NOW(), NOW()),
      ('Кровля', 'Кровельные материалы', 9, 320, 'м²', 1000, 50, true, 4.6, 27, NOW(), NOW()),
      ('Инструменты', 'Строительные инструменты', 10, 3500, 'шт', 20, 1, true, 4.6, 34, NOW(), NOW())
    `);
    console.log("✅ Создано 10 материалов");
    
    // Проверяем результат через прямой SQL
    const result = await db.sequelize.query(`
      SELECT 
        mc.name as category_name,
        m.name as material_name,
        m.price,
        m.unit
      FROM materials m
      JOIN materialCategories mc ON m.category_id = mc.id
      ORDER BY mc.sort_order;
    `);
    
    console.log("🎉 Результат через прямой SQL:");
    result[0].forEach(row => {
      console.log(`- ${row.material_name} (${row.category_name}) - ${row.price} ${row.unit}`);
    });
    
    // Проверяем через модели Sequelize
    const categories = await db.materialCategories.findAll({
      where: { isActive: true },
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
    
    console.log(`🎉 Результат через Sequelize: ${categories.length} категорий, ${materials.length} материалов`);
    
    categories.forEach(cat => {
      console.log(`- ${cat.name} (id: ${cat.id})`);
    });
    
    materials.forEach(mat => {
      console.log(`- ${mat.name} (категория: ${mat.category.name})`);
    });
    
    console.log("🎉 Принудительное создание таблиц завершено!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при создании таблиц:", error);
    process.exit(1);
  }
}

forceSQLCreate();
