const { fixCategories } = require('./app/seeders/fix-categories');
const { createBasicMaterials } = require('./app/seeders/basic-materials');
const db = require("./app/models");

/**
 * Скрипт для исправления структуры материалов
 */
async function runFix() {
  try {
    console.log("🔧 Начинаю исправление структуры материалов...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Исправляем категории
    await fixCategories();
    
    // Создаем базовые материалы
    await createBasicMaterials();
    
    console.log("🎉 Структура материалов успешно исправлена!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при исправлении материалов:", error);
    process.exit(1);
  }
}

runFix();
