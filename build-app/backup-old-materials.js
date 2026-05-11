const db = require('./app/models');
const fs = require('fs');

/**
 * Сохранение старых данных в файл
 */
async function backupOldData() {
  try {
    console.log("🔄 Сохранение старых данных...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Получаем категории
    const categories = await db.materialCategories.findAll({
      order: [['sortOrder', 'ASC']]
    });
    
    // Получаем материалы
    const materials = await db.material.findAll({
      include: [
        {
          model: db.materialCategories,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });
    
    // Формируем данные для сохранения
    const backupData = {
      timestamp: new Date().toISOString(),
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        level: cat.level,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder,
        parentCategoryId: cat.parentCategoryId
      })),
      materials: materials.map(mat => ({
        id: mat.id,
        name: mat.name,
        description: mat.description,
        categoryId: mat.categoryId,
        categoryName: mat.category?.name,
        price: mat.price,
        unit: mat.unit,
        inStock: mat.inStock,
        minOrder: mat.minOrder,
        isActive: mat.isActive,
        rating: mat.rating,
        reviewCount: mat.reviewCount
      }))
    };
    
    // Сохраняем в файл
    const backupPath = './backup-old-materials.json';
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
    
    console.log(`✅ Данные сохранены в файл: ${backupPath}`);
    console.log(`📊 Сохранено: ${backupData.categories.length} категорий, ${backupData.materials.length} материалов`);
    
    // Показываем пример данных
    console.log("\n📋 Пример категорий:");
    backupData.categories.slice(0, 3).forEach(cat => {
      console.log(`- ${cat.name} (id: ${cat.id})`);
    });
    
    console.log("\n📋 Пример материалов:");
    backupData.materials.slice(0, 3).forEach(mat => {
      console.log(`- ${mat.name} (${mat.categoryName}) - ${mat.price} ${mat.unit}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при сохранении данных:", error);
    process.exit(1);
  }
}

backupOldData();
