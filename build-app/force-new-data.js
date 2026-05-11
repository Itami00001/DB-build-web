const db = require('./app/models');

/**
 * Принудительное создание новых данных
 */
async function forceNewData() {
  try {
    console.log("🔄 Принудительное создание новых данных...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Удаляем все данные из таблиц
    await db.sequelize.query('DELETE FROM materials;');
    await db.sequelize.query('DELETE FROM materialCategories;');
    console.log("✅ Все данные удалены");
    
    // Сбрасываем счетчики
    await db.sequelize.query('ALTER SEQUENCE material_id_seq RESTART WITH 1;');
    await db.sequelize.query('ALTER SEQUENCE material_categories_id_seq RESTART WITH 1;');
    console.log("✅ Счетчики сброшены");
    
    // Вставляем новые категории напрямую через SQL
    await db.sequelize.query(`
      INSERT INTO materialCategories (name, description, level, isActive, sortOrder, createdAt, updatedAt) VALUES
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
    
    // Вставляем новые материалы напрямую через SQL
    await db.sequelize.query(`
      INSERT INTO materials (name, description, categoryId, price, unit, inStock, minOrder, isActive, rating, reviewCount, createdAt, updatedAt) VALUES
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
    
    // Проверяем результат
    const result = await db.sequelize.query(`
      SELECT 
        mc.name as category_name,
        m.name as material_name,
        m.price,
        m.unit
      FROM materials m
      JOIN materialCategories mc ON m.categoryId = mc.id
      ORDER BY mc.sortOrder;
    `);
    
    console.log("🎉 Результат:");
    result[0].forEach(row => {
      console.log(`- ${row.material_name} (${row.category_name}) - ${row.price} ${row.unit}`);
    });
    
    console.log("🎉 Принудительное создание данных завершено!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка:", error);
    process.exit(1);
  }
}

forceNewData();
