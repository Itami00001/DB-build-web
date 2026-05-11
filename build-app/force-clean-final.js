const db = require('./app/models');

/**
 * Финальная очистка - удаляем все таблицы и создаем заново
 */
async function forceCleanFinal() {
  try {
    console.log("🔄 Финальная очистка базы данных...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Удаляем ВСЕ таблицы с materials в названии
    await db.sequelize.query('DROP TABLE IF EXISTS material CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS materials CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS materialCategories CASCADE;');
    await db.sequelize.query('DROP TABLE IF EXISTS materialcategories CASCADE;');
    console.log("✅ Все таблицы материалов удалены");
    
    // Создаем таблицы заново через модели
    await db.materialCategories.sync({ force: true });
    await db.material.sync({ force: true });
    console.log("✅ Таблицы созданы через модели");
    
    // Создаем 10 правильных категорий
    const categories = await db.materialCategories.bulkCreate([
      { name: "Кирпич", description: "Все виды кирпича", level: 1, isActive: true, sortOrder: 1, parentCategoryId: null },
      { name: "Блоки", description: "Стеновые блоки", level: 1, isActive: true, sortOrder: 2, parentCategoryId: null },
      { name: "Краски", description: "Краски и лакокрасочные материалы", level: 1, isActive: true, sortOrder: 3, parentCategoryId: null },
      { name: "Цемент", description: "Цемент и сухие смеси", level: 1, isActive: true, sortOrder: 4, parentCategoryId: null },
      { name: "Песок", description: "Песок и щебень", level: 1, isActive: true, sortOrder: 5, parentCategoryId: null },
      { name: "Арматура", description: "Арматура и металлопрокат", level: 1, isActive: true, sortOrder: 6, parentCategoryId: null },
      { name: "Утеплитель", description: "Теплоизоляционные материалы", level: 1, isActive: true, sortOrder: 7, parentCategoryId: null },
      { name: "Гидроизоляция", description: "Гидроизоляционные материалы", level: 1, isActive: true, sortOrder: 8, parentCategoryId: null },
      { name: "Кровля", description: "Кровельные материалы", level: 1, isActive: true, sortOrder: 9, parentCategoryId: null },
      { name: "Инструменты", description: "Строительные инструменты", level: 1, isActive: true, sortOrder: 10, parentCategoryId: null }
    ]);
    
    console.log(`✅ Создано ${categories.length} категорий`);
    
    // Создаем 10 правильных материалов
    const materials = await db.material.bulkCreate([
      { name: "Кирпич", description: "Строительный кирпич", categoryId: categories[0].id, price: 15.5, unit: "шт", inStock: 10000, minOrder: 100, isActive: true, rating: 4.5, reviewCount: 23 },
      { name: "Блоки", description: "Стеновые блоки", categoryId: categories[1].id, price: 125, unit: "шт", inStock: 500, minOrder: 10, isActive: true, rating: 4.7, reviewCount: 15 },
      { name: "Краски", description: "Лакокрасочные материалы", categoryId: categories[2].id, price: 280, unit: "л", inStock: 150, minOrder: 5, isActive: true, rating: 4.4, reviewCount: 19 },
      { name: "Цемент", description: "Цемент и сухие смеси", categoryId: categories[3].id, price: 4200, unit: "т", inStock: 80, minOrder: 1, isActive: true, rating: 4.7, reviewCount: 31 },
      { name: "Песок", description: "Песок и щебень", categoryId: categories[4].id, price: 450, unit: "м³", inStock: 50, minOrder: 5, isActive: true, rating: 4.3, reviewCount: 16 },
      { name: "Арматура", description: "Стальная арматура", categoryId: categories[5].id, price: 45, unit: "т", inStock: 50, minOrder: 0.5, isActive: true, rating: 4.3, reviewCount: 31 },
      { name: "Утеплитель", description: "Теплоизоляционные материалы", categoryId: categories[6].id, price: 850, unit: "м³", inStock: 30, minOrder: 1, isActive: true, rating: 4.8, reviewCount: 24 },
      { name: "Гидроизоляция", description: "Гидроизоляционные материалы", categoryId: categories[7].id, price: 280, unit: "м²", inStock: 500, minOrder: 15, isActive: true, rating: 4.5, reviewCount: 20 },
      { name: "Кровля", description: "Кровельные материалы", categoryId: categories[8].id, price: 320, unit: "м²", inStock: 1000, minOrder: 50, isActive: true, rating: 4.6, reviewCount: 27 },
      { name: "Инструменты", description: "Строительные инструменты", categoryId: categories[9].id, price: 3500, unit: "шт", inStock: 20, minOrder: 1, isActive: true, rating: 4.6, reviewCount: 34 }
    ]);
    
    console.log(`✅ Создано ${materials.length} материалов`);
    
    // Проверяем результат
    const finalCategories = await db.materialCategories.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    
    const finalMaterials = await db.material.findAll({
      include: [
        {
          model: db.materialCategories,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });
    
    console.log(`🎉 Финальный результат: ${finalCategories.length} категорий, ${finalMaterials.length} материалов`);
    
    finalCategories.forEach(cat => {
      console.log(`- ${cat.name} (id: ${cat.id})`);
    });
    
    finalMaterials.forEach(mat => {
      console.log(`- ${mat.name} (категория: ${mat.category.name})`);
    });
    
    console.log("🎉 Финальная очистка завершена!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при финальной очистке:", error);
    process.exit(1);
  }
}

forceCleanFinal();
