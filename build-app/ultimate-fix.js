const db = require('./app/models');

/**
 * Ультимативное исправление с последовательным созданием
 */
async function ultimateFix() {
  try {
    console.log("🔄 Ультимативное исправление...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Полностью удаляем все
    await db.material.destroy({ where: {}, force: true });
    await db.materialCategories.destroy({ where: {}, force: true });
    console.log("Все данные удалены");
    
    // Создаем категории последовательно
    console.log("Создание категорий...");
    const categories = [];
    
    const categoryNames = [
      { name: "Кирпич", description: "Все виды кирпича" },
      { name: "Блоки", description: "Стеновые блоки" },
      { name: "Краски", description: "Краски и лакокрасочные материалы" },
      { name: "Цемент", description: "Цемент и сухие смеси" },
      { name: "Песок", description: "Песок и щебень" },
      { name: "Арматура", description: "Арматура и металлопрокат" },
      { name: "Утеплитель", description: "Теплоизоляционные материалы" },
      { name: "Гидроизоляция", description: "Гидроизоляционные материалы" },
      { name: "Кровля", description: "Кровельные материалы" },
      { name: "Инструменты", description: "Строительные инструменты" }
    ];
    
    for (let i = 0; i < categoryNames.length; i++) {
      const cat = await db.materialCategories.create({
        name: categoryNames[i].name,
        description: categoryNames[i].description,
        level: 1,
        isActive: true,
        sortOrder: i + 1,
        parentCategoryId: null
      });
      categories.push(cat);
      console.log(`✅ Создана категория: ${cat.name} (id: ${cat.id})`);
    }
    
    // Создаем материалы последовательно
    console.log("Создание материалов...");
    const materialData = [
      { name: "Кирпич", price: 15.5, unit: "шт", stock: 10000 },
      { name: "Блоки", price: 125, unit: "шт", stock: 500 },
      { name: "Краски", price: 280, unit: "л", stock: 150 },
      { name: "Цемент", price: 4200, unit: "т", stock: 80 },
      { name: "Песок", price: 450, unit: "м³", stock: 50 },
      { name: "Арматура", price: 45, unit: "т", stock: 50 },
      { name: "Утеплитель", price: 850, unit: "м³", stock: 30 },
      { name: "Гидроизоляция", price: 280, unit: "м²", stock: 500 },
      { name: "Кровля", price: 320, unit: "м²", stock: 1000 },
      { name: "Инструменты", price: 3500, unit: "шт", stock: 20 }
    ];
    
    for (let i = 0; i < materialData.length; i++) {
      const mat = await db.material.create({
        name: materialData[i].name,
        description: `Строительный ${materialData[i].name.toLowerCase()}`,
        categoryId: categories[i].id,
        price: materialData[i].price,
        unit: materialData[i].unit,
        inStock: materialData[i].stock,
        minOrder: 1,
        isActive: true,
        rating: 4.5,
        reviewCount: 10
      });
      console.log(`✅ Создан материал: ${mat.name} (категория: ${categories[i].name})`);
    }
    
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
    
    console.log(`🎉 Итог: ${finalCategories.length} категорий, ${finalMaterials.length} материалов`);
    
    finalCategories.forEach(cat => {
      console.log(`- ${cat.name} (id: ${cat.id})`);
    });
    
    finalMaterials.forEach(mat => {
      console.log(`- ${mat.name} (категория: ${mat.category.name})`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при ультимативном исправлении:", error);
    process.exit(1);
  }
}

ultimateFix();
