const { seedUsers } = require('./users.seed');
const { seedMaterials } = require('./materials.seed');
const { seedAdvertisements } = require('./advertisements.seed');

/**
 * Основной файл для управления начальными данными
 * Создает пользователей, материалы и объявления для строй-фирмы
 */
const seedInitialData = async () => {
  try {
    console.log("🚀 Начинаем создание начальных данных для Build-Shop...");

    // Создаем пользователей
    await seedUsers();

    // Создаем категории и материалы
    await seedMaterials();

    // Создаем тестовые объявления
    await seedAdvertisements();

    console.log("✅ Начальные данные успешно созданы!");
    console.log("🎯 Проект готов к использованию.");

  } catch (error) {
    console.error("❌ Ошибка при создании начальных данных:", error);
    throw error;
  }
};

module.exports = { seedInitialData };
