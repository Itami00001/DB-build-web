const db = require('./app/models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Connected to DB');
    
    const categories = await db.materialCategories.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    
    console.log('Categories found:', categories.length);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (id: ${cat.id}, active: ${cat.isActive})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
