const db = require("../models");

/**
 * Исправление категорий материалов
 * Создает простые категории: Кирпич, Блоки, Краски и т.д.
 */
const fixCategories = async () => {
  try {
    console.log("Исправление категорий материалов...");

    // Сначала удаляем материалы, потом категории (из-за внешнего ключа)
    await db.material.destroy({ where: {}, force: true });
    console.log("Существующие материалы удалены");
    
    await db.materialCategories.destroy({ where: {}, force: true });
    console.log("Существующие категории удалены");

    // Создаем новые простые категории
    const categories = await db.materialCategories.bulkCreate([
      {
        name: "Кирпич",
        description: "Все виды кирпича",
        level: 1,
        isActive: true,
        sortOrder: 1,
        parentCategoryId: null
      },
      {
        name: "Блоки",
        description: "Стеновые блоки",
        level: 1,
        isActive: true,
        sortOrder: 2,
        parentCategoryId: null
      },
      {
        name: "Краски",
        description: "Краски и лакокрасочные материалы",
        level: 1,
        isActive: true,
        sortOrder: 3,
        parentCategoryId: null
      },
      {
        name: "Цемент",
        description: "Цемент и сухие смеси",
        level: 1,
        isActive: true,
        sortOrder: 4,
        parentCategoryId: null
      },
      {
        name: "Песок",
        description: "Песок и щебень",
        level: 1,
        isActive: true,
        sortOrder: 5,
        parentCategoryId: null
      },
      {
        name: "Арматура",
        description: "Арматура и металлопрокат",
        level: 1,
        isActive: true,
        sortOrder: 6,
        parentCategoryId: null
      },
      {
        name: "Утеплитель",
        description: "Теплоизоляционные материалы",
        level: 1,
        isActive: true,
        sortOrder: 7,
        parentCategoryId: null
      },
      {
        name: "Гидроизоляция",
        description: "Гидроизоляционные материалы",
        level: 1,
        isActive: true,
        sortOrder: 8,
        parentCategoryId: null
      },
      {
        name: "Кровля",
        description: "Кровельные материалы",
        level: 1,
        isActive: true,
        sortOrder: 9,
        parentCategoryId: null
      },
      {
        name: "Инструменты",
        description: "Строительные инструменты",
        level: 1,
        isActive: true,
        sortOrder: 10,
        parentCategoryId: null
      }
    ]);

    console.log(`✅ Создано ${categories.length} новых категорий`);
    return categories;

  } catch (error) {
    console.error("❌ Ошибка при исправлении категорий:", error);
    throw error;
  }
};

module.exports = { fixCategories };
