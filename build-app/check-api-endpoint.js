const db = require('./app/models');

/**
 * Проверка API эндпоинтов
 */
async function checkApiEndpoint() {
  try {
    console.log("🔍 Проверка API эндпоинтов...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Проверяем прямой запрос к базе
    const directQuery = await db.sequelize.query(`
      SELECT 
        mc.name as category_name,
        m.name as material_name,
        m.price,
        m.unit
      FROM materials m
      JOIN materialcategories mc ON m.category_id = mc.id
      ORDER BY mc.sort_order;
    `);
    
    console.log("📊 Прямой запрос к базе:");
    directQuery[0].forEach(row => {
      console.log(`- ${row.material_name} (${row.category_name}) - ${row.price} ${row.unit}`);
    });
    
    // Проверяем через модели Sequelize
    const sequelizeCategories = await db.materialCategories.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    
    const sequelizeMaterials = await db.material.findAll({
      include: [
        {
          model: db.materialCategories,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });
    
    console.log(`📊 Через Sequelize: ${sequelizeCategories.length} категорий, ${sequelizeMaterials.length} материалов`);
    
    // Проверяем контроллер материалов
    console.log("🔍 Проверка контроллера материалов...");
    
    try {
      const materialController = require('./app/controllers/material.controller');
      console.log("✅ Контроллер материалов загружен");
      
      // Проверяем, что возвращает контроллер
      console.log("📋 Методы контроллера:");
      console.log(`- findAll: ${typeof materialController.findAll}`);
      console.log(`- findOne: ${typeof materialController.findOne}`);
      
    } catch (error) {
      console.log(`❌ Ошибка при загрузке контроллера: ${error.message}`);
    }
    
    // Проверяем роуты материалов
    console.log("🔍 Проверка роутов материалов...");
    
    try {
      const materialRoutes = require('./app/routes/material.routes');
      console.log("✅ Роуты материалов загружены");
      
    } catch (error) {
      console.log(`❌ Ошибка при загрузке роутов: ${error.message}`);
    }
    
    // Проверяем, возможно ли есть middleware кэширования
    console.log("🔍 Проверка middleware...");
    
    try {
      const express = require('express');
      console.log("✅ Express загружен");
      
      // Проверяем, возможно ли есть кэширование на уровне приложения
      const app = express();
      console.log(`📋 Express version: ${express.version}`);
      
    } catch (error) {
      console.log(`❌ Ошибка при загрузке Express: ${error.message}`);
    }
    
    // Проверяем, возможно ли есть проблема с environment variables
    console.log("🔍 Проверка environment variables...");
    
    console.log(`📊 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`📊 DB_HOST: ${process.env.DB_HOST}`);
    console.log(`📊 DB_NAME: ${process.env.DB_NAME}`);
    
    console.log("🎉 Проверка API эндпоинтов завершена!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при проверке API эндпоинтов:", error);
    process.exit(1);
  }
}

checkApiEndpoint();
