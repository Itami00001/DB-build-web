const db = require('./app/models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Connected to DB');
    
    // Проверяем категории
    const categories = await db.materialCategories.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    
    console.log('Categories found:', categories.length);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (id: ${cat.id})`);
    });
    
    // Проверяем материалы
    const materials = await db.material.findAll({
      include: [
        {
          model: db.materialCategories,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });
    
    console.log('Materials found:', materials.length);
    materials.forEach(mat => {
      console.log(`- ${mat.name} (category: ${mat.category?.name || 'null'})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
