const db = require('./app/models');

/**
 * Принудительная полная очистка и пересоздание материалов
 */
async function forceReset() {
  try {
    console.log("🔄 Принудительная очистка базы данных...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Отключаем проверки внешних ключей
    await db.sequelize.query('SET session_replication_role = replica;');
    
    // Удаляем все таблицы в правильном порядке
    console.log("Удаление таблиц...");
    
    // Сначала удаляем материалы
    await db.sequelize.query('DROP TABLE IF EXISTS materials CASCADE;');
    console.log("Таблица materials удалена");
    
    // Потом удаляем категории
    await db.sequelize.query('DROP TABLE IF EXISTS materialCategories CASCADE;');
    console.log("Таблица materialCategories удалена");
    
    // Создаем таблицы заново
    console.log("Создание таблиц заново...");
    
    // Создаем категории
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
    console.log("Таблица materialCategories создана");
    
    // Создаем материалы
    await db.sequelize.query(`
      CREATE TABLE materials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER NOT NULL REFERENCES materialCategories(id),
        price DECIMAL(10,2) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        in_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
        min_order DECIMAL(10,2) NOT NULL DEFAULT 1,
        image VARCHAR(255),
        specifications JSONB DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        rating DECIMAL(3,2) NOT NULL DEFAULT 0,
        review_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Таблица materials создана");
    
    // Включаем обратно проверки внешних ключей
    await db.sequelize.query('SET session_replication_role = DEFAULT;');
    
    // Создаем категории
    console.log("Создание 10 категорий...");
    const categoriesResult = await db.sequelize.query(`
      INSERT INTO materialCategories (name, description, level, is_active, sort_order) VALUES
      ('Кирпич', 'Все виды кирпича', 1, true, 1),
      ('Блоки', 'Стеновые блоки', 1, true, 2),
      ('Краски', 'Краски и лакокрасочные материалы', 1, true, 3),
      ('Цемент', 'Цемент и сухие смеси', 1, true, 4),
      ('Песок', 'Песок и щебень', 1, true, 5),
      ('Арматура', 'Арматура и металлопрокат', 1, true, 6),
      ('Утеплитель', 'Теплоизоляционные материалы', 1, true, 7),
      ('Гидроизоляция', 'Гидроизоляционные материалы', 1, true, 8),
      ('Кровля', 'Кровельные материалы', 1, true, 9),
      ('Инструменты', 'Строительные инструменты', 1, true, 10)
      RETURNING id, name;
    `);
    
    console.log(`✅ Создано ${categoriesResult[1].length} категорий`);
    
    // Создаем материалы
    console.log("Создание базовых материалов...");
    const materialsResult = await db.sequelize.query(`
      INSERT INTO materials (name, description, category_id, price, unit, in_stock, min_order, is_active, rating, review_count) VALUES
      ('Кирпич', 'Строительный кирпич', 1, 15.5, 'шт', 10000, 100, true, 4.5, 23),
      ('Блоки', 'Стеновые блоки', 2, 125, 'шт', 500, 10, true, 4.7, 15),
      ('Краски', 'Лакокрасочные материалы', 3, 280, 'л', 150, 5, true, 4.4, 19),
      ('Цемент', 'Цемент и сухие смеси', 4, 4200, 'т', 80, 1, true, 4.7, 31),
      ('Песок', 'Песок и щебень', 5, 450, 'м³', 50, 5, true, 4.3, 16),
      ('Арматура', 'Стальная арматура', 6, 45, 'т', 50, 0.5, true, 4.3, 31),
      ('Утеплитель', 'Теплоизоляционные материалы', 7, 850, 'м³', 30, 1, true, 4.8, 24),
      ('Гидроизоляция', 'Гидроизоляционные материалы', 8, 280, 'м²', 500, 15, true, 4.5, 20),
      ('Кровля', 'Кровельные материалы', 9, 320, 'м²', 1000, 50, true, 4.6, 27),
      ('Инструменты', 'Строительные инструменты', 10, 3500, 'шт', 20, 1, true, 4.6, 34)
      RETURNING id, name;
    `);
    
    console.log(`✅ Создано ${materialsResult[1].length} материалов`);
    console.log("🎉 База данных полностью пересоздана с 10 категориями!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при принудительном сбросе:", error);
    process.exit(1);
  }
}

forceReset();
