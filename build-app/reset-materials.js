const db = require('./app/models');

/**
 * Полная очистка и пересоздание материалов и категорий
 */
async function resetMaterials() {
  try {
    console.log("🔄 Полная очистка и пересоздание материалов...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Полностью удаляем все материалы и категории
    await db.material.destroy({ where: {}, force: true });
    console.log("Все материалы удалены");
    
    await db.materialCategories.destroy({ where: {}, force: true });
    console.log("Все категории удалены");
    
    console.log("Счетчики ID сброшены (пропущено из-за ошибок в PostgreSQL)");
    
    // Создаем новые категории
    const categories = await db.materialCategories.bulkCreate([
      {
        name: "Кирпич",
        description: "Все виды кирпича",
        level: 1,
        isActive: true,
        sortOrder: 1,
        parentCategoryId: null
      },
      {
        name: "Блоки",
        description: "Стеновые блоки",
        level: 1,
        isActive: true,
        sortOrder: 2,
        parentCategoryId: null
      },
      {
        name: "Краски",
        description: "Краски и лакокрасочные материалы",
        level: 1,
        isActive: true,
        sortOrder: 3,
        parentCategoryId: null
      },
      {
        name: "Цемент",
        description: "Цемент и сухие смеси",
        level: 1,
        isActive: true,
        sortOrder: 4,
        parentCategoryId: null
      },
      {
        name: "Песок",
        description: "Песок и щебень",
        level: 1,
        isActive: true,
        sortOrder: 5,
        parentCategoryId: null
      },
      {
        name: "Арматура",
        description: "Арматура и металлопрокат",
        level: 1,
        isActive: true,
        sortOrder: 6,
        parentCategoryId: null
      },
      {
        name: "Утеплитель",
        description: "Теплоизоляционные материалы",
        level: 1,
        isActive: true,
        sortOrder: 7,
        parentCategoryId: null
      },
      {
        name: "Гидроизоляция",
        description: "Гидроизоляционные материалы",
        level: 1,
        isActive: true,
        sortOrder: 8,
        parentCategoryId: null
      },
      {
        name: "Кровля",
        description: "Кровельные материалы",
        level: 1,
        isActive: true,
        sortOrder: 9,
        parentCategoryId: null
      },
      {
        name: "Инструменты",
        description: "Строительные инструменты",
        level: 1,
        isActive: true,
        sortOrder: 10,
        parentCategoryId: null
      }
    ]);
    
    console.log(`✅ Создано ${categories.length} категорий`);
    
    // Создаем базовые материалы
    const materials = await db.material.bulkCreate([
      // Кирпич
      {
        name: "Кирпич",
        description: "Строительный кирпич",
        categoryId: categories.find(c => c.name === "Кирпич")?.id,
        price: 15.5,
        unit: "шт",
        inStock: 10000,
        minOrder: 100,
        isActive: true,
        rating: 4.5,
        reviewCount: 23
      },

      // Блоки
      {
        name: "Блоки",
        description: "Стеновые блоки",
        categoryId: categories.find(c => c.name === "Блоки")?.id,
        price: 125,
        unit: "шт",
        inStock: 500,
        minOrder: 10,
        isActive: true,
        rating: 4.7,
        reviewCount: 15
      },

      // Краски
      {
        name: "Краски",
        description: "Лакокрасочные материалы",
        categoryId: categories.find(c => c.name === "Краски")?.id,
        price: 280,
        unit: "л",
        inStock: 150,
        minOrder: 5,
        isActive: true,
        rating: 4.4,
        reviewCount: 19
      },

      // Цемент
      {
        name: "Цемент",
        description: "Цемент и сухие смеси",
        categoryId: categories.find(c => c.name === "Цемент")?.id,
        price: 4200,
        unit: "т",
        inStock: 80,
        minOrder: 1,
        isActive: true,
        rating: 4.7,
        reviewCount: 31
      },

      // Песок
      {
        name: "Песок",
        description: "Песок и щебень",
        categoryId: categories.find(c => c.name === "Песок")?.id,
        price: 450,
        unit: "м³",
        inStock: 50,
        minOrder: 5,
        isActive: true,
        rating: 4.3,
        reviewCount: 16
      },

      // Арматура
      {
        name: "Арматура",
        description: "Стальная арматура",
        categoryId: categories.find(c => c.name === "Арматура")?.id,
        price: 45,
        unit: "т",
        inStock: 50,
        minOrder: 0.5,
        isActive: true,
        rating: 4.3,
        reviewCount: 31
      },

      // Утеплитель
      {
        name: "Утеплитель",
        description: "Теплоизоляционные материалы",
        categoryId: categories.find(c => c.name === "Утеплитель")?.id,
        price: 850,
        unit: "м³",
        inStock: 30,
        minOrder: 1,
        isActive: true,
        rating: 4.8,
        reviewCount: 24
      },

      // Гидроизоляция
      {
        name: "Гидроизоляция",
        description: "Гидроизоляционные материалы",
        categoryId: categories.find(c => c.name === "Гидроизоляция")?.id,
        price: 280,
        unit: "м²",
        inStock: 500,
        minOrder: 15,
        isActive: true,
        rating: 4.5,
        reviewCount: 20
      },

      // Кровля
      {
        name: "Кровля",
        description: "Кровельные материалы",
        categoryId: categories.find(c => c.name === "Кровля")?.id,
        price: 320,
        unit: "м²",
        inStock: 1000,
        minOrder: 50,
        isActive: true,
        rating: 4.6,
        reviewCount: 27
      },

      // Инструменты
      {
        name: "Инструменты",
        description: "Строительные инструменты",
        categoryId: categories.find(c => c.name === "Инструменты")?.id,
        price: 3500,
        unit: "шт",
        inStock: 20,
        minOrder: 1,
        isActive: true,
        rating: 4.6,
        reviewCount: 34
      }
    ]);
    
    console.log(`✅ Создано ${materials.length} материалов`);
    console.log("🎉 Материалы полностью пересозданы!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при пересоздании материалов:", error);
    process.exit(1);
  }
}

resetMaterials();
