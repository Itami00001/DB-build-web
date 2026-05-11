const db = require('./app/models');

/**
 * Создание новых материалов с правильными категориями
 */
async function createNewMaterials() {
  try {
    console.log("🔄 Создание новых материалов...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Получаем существующие категории
    const categories = await db.materialCategories.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    
    console.log('Найдено категорий:', categories.length);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (id: ${cat.id})`);
    });
    
    // Удаляем существующие материалы
    await db.material.destroy({ where: {}, force: true });
    console.log("Существующие материалы удалены");
    
    // Создаем новые материалы для каждой категории
    const materialsToCreate = [];
    
    // Для каждой категории создаем один материал
    categories.forEach(category => {
      materialsToCreate.push({
        name: category.name, // Название материала = название категории
        description: category.description,
        categoryId: category.id,
        price: category.name === 'Кирпич' ? 15.5 :
                category.name === 'Блоки' ? 125 :
                category.name === 'Краски' ? 280 :
                category.name === 'Цемент' ? 4200 :
                category.name === 'Песок' ? 450 :
                category.name === 'Арматура' ? 45 :
                category.name === 'Утеплитель' ? 850 :
                category.name === 'Гидроизоляция' ? 280 :
                category.name === 'Кровля' ? 320 :
                category.name === 'Инструменты' ? 3500 : 100,
        unit: category.name === 'Цемент' || category.name === 'Песок' || category.name === 'Арматура' ? 'т' :
              category.name === 'Краски' || category.name === 'Гидроизоляция' || category.name === 'Кровля' || category.name === 'Утеплитель' ? 'м²' :
              'шт',
        inStock: 1000,
        minOrder: 1,
        isActive: true,
        rating: 4.5,
        reviewCount: 10
      });
    });
    
    console.log('Создание материалов:', materialsToCreate.map(m => ({name: m.name, categoryId: m.categoryId})));
    
    // Создаем материалы
    const createdMaterials = await db.material.bulkCreate(materialsToCreate);
    console.log(`✅ Создано ${createdMaterials.length} новых материалов`);
    
    // Проверяем результат
    const finalMaterials = await db.material.findAll({
      include: [
        {
          model: db.materialCategories,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });
    
    console.log('Итого материалов в базе:', finalMaterials.length);
    finalMaterials.forEach(mat => {
      console.log(`- ${mat.name} (категория: ${mat.category.name})`);
    });
    
    console.log("🎉 Новые материалы успешно созданы!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при создании материалов:", error);
    process.exit(1);
  }
}

createNewMaterials();
