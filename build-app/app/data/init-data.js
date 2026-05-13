/**
 * Скрипт для автоматической загрузки начальных данных
 * Запускается при старте Docker контейнера
 * Проверяет наличие данных и загружает только если база пустая
 */

const db = require("../models");
const { seedUsers } = require('../seeders/users.seed');
const { seedMaterials } = require('../seeders/materials.seed');
const { seedAdvertisements } = require('../seeders/advertisements.seed');

async function checkAndSeedData() {
  try {
    console.log("🔍 Проверка наличия начальных данных...");

    // Проверяем наличие пользователей
    const userCount = await db.user.count();
    console.log(`👤 Пользователей в базе: ${userCount}`);

    // Проверяем наличие категорий материалов
    const categoryCount = await db.materialCategories.count();
    console.log(`📁 Категорий материалов: ${categoryCount}`);

    // Проверяем наличие материалов
    const materialCount = await db.material.count();
    console.log(`🧱 Материалов: ${materialCount}`);

    // Проверяем наличие объявлений
    const adCount = await db.advertisement.count();
    console.log(`📢 Объявлений: ${adCount}`);

    // Если данных нет или их мало, загружаем начальные данные
    if (userCount === 0 || categoryCount === 0 || materialCount === 0 || adCount === 0) {
      console.log("🚀 Загрузка начальных данных...");
      
      await seedUsers();
      await seedMaterials();
      await seedAdvertisements();
      
      console.log("✅ Начальные данные успешно загружены!");
    } else {
      console.log("✅ Начальные данные уже существуют в базе");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка при загрузке начальных данных:", error);
    process.exit(1);
  }
}

// Запускаем скрипт
checkAndSeedData();
