const db = require('./app/models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Connected to DB');
    
    // Проверяем категории
    const categories = await db.materialCategories.findAll({
      order: [['sortOrder', 'ASC']]
    });
    
    console.log('Categories found:', categories.length);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (id: ${cat.id})`);
    });
    
    // Проверяем материалы
    const materials = await db.material.findAll();
    console.log('Materials found:', materials.length);
    
    if (materials.length === 0) {
      console.log('Materials are empty, trying to create basic ones...');
      
      // Создаем один материал для категории Кирпич
      const brickCategory = categories.find(c => c.name === 'Кирпич');
      if (brickCategory) {
        try {
          await db.material.create({
            name: 'Кирпич',
            description: 'Строительный кирпич',
            categoryId: brickCategory.id,
            price: 15.5,
            unit: 'шт',
            inStock: 10000,
            minOrder: 100,
            isActive: true,
            rating: 4.5,
            reviewCount: 23
          });
          console.log('✅ Created material: Кирпич');
        } catch (error) {
          console.error('❌ Error creating material:', error);
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
