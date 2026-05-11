const db = require("../models");

/**
 * Создание базовых материалов
 * Создает простые материалы без цен в названиях
 */
const createBasicMaterials = async () => {
  try {
    console.log("Создание базовых материалов...");

    // Получаем категории
    const categories = await db.materialCategories.findAll({
      order: [['sortOrder', 'ASC']]
    });

    if (categories.length === 0) {
      console.error("❌ Категории не найдены. Сначала запустите исправление категорий.");
      return;
    }

    // Удаляем существующие материалы
    await db.material.destroy({ where: {}, force: true });
    console.log("Существующие материалы удалены");

    // Создаем базовые материалы для каждой категории
    const materials = await db.material.bulkCreate([
      // Кирпич
      {
        name: "Кирпич",
        description: "Строительный кирпич",
        categoryId: categories.find(c => c.name === "Кирпич")?.id,
        price: 15.5,
        unit: "шт",
        inStock: 10000,
        minOrder: 100,
        isActive: true,
        rating: 4.5,
        reviewCount: 23
      },

      // Блоки
      {
        name: "Блоки",
        description: "Стеновые блоки",
        categoryId: categories.find(c => c.name === "Блоки")?.id,
        price: 125,
        unit: "шт",
        inStock: 500,
        minOrder: 10,
        isActive: true,
        rating: 4.7,
        reviewCount: 15
      },

      // Краски
      {
        name: "Краски",
        description: "Лакокрасочные материалы",
        categoryId: categories.find(c => c.name === "Краски")?.id,
        price: 280,
        unit: "л",
        inStock: 150,
        minOrder: 5,
        isActive: true,
        rating: 4.4,
        reviewCount: 19
      },

      // Цемент
      {
        name: "Цемент",
        description: "Цемент и сухие смеси",
        categoryId: categories.find(c => c.name === "Цемент")?.id,
        price: 4200,
        unit: "т",
        inStock: 80,
        minOrder: 1,
        isActive: true,
        rating: 4.7,
        reviewCount: 31
      },

      // Песок
      {
        name: "Песок",
        description: "Песок и щебень",
        categoryId: categories.find(c => c.name === "Песок")?.id,
        price: 450,
        unit: "м³",
        inStock: 50,
        minOrder: 5,
        isActive: true,
        rating: 4.3,
        reviewCount: 16
      },

      // Арматура
      {
        name: "Арматура",
        description: "Стальная арматура",
        categoryId: categories.find(c => c.name === "Арматура")?.id,
        price: 45,
        unit: "т",
        inStock: 50,
        minOrder: 0.5,
        isActive: true,
        rating: 4.3,
        reviewCount: 31
      },

      // Утеплитель
      {
        name: "Утеплитель",
        description: "Теплоизоляционные материалы",
        categoryId: categories.find(c => c.name === "Утеплитель")?.id,
        price: 850,
        unit: "м³",
        inStock: 30,
        minOrder: 1,
        isActive: true,
        rating: 4.8,
        reviewCount: 24
      },

      // Гидроизоляция
      {
        name: "Гидроизоляция",
        description: "Гидроизоляционные материалы",
        categoryId: categories.find(c => c.name === "Гидроизоляция")?.id,
        price: 280,
        unit: "м²",
        inStock: 500,
        minOrder: 15,
        isActive: true,
        rating: 4.5,
        reviewCount: 20
      },

      // Кровля
      {
        name: "Кровля",
        description: "Кровельные материалы",
        categoryId: categories.find(c => c.name === "Кровля")?.id,
        price: 320,
        unit: "м²",
        inStock: 1000,
        minOrder: 50,
        isActive: true,
        rating: 4.6,
        reviewCount: 27
      },

      // Инструменты
      {
        name: "Инструменты",
        description: "Строительные инструменты",
        categoryId: categories.find(c => c.name === "Инструменты")?.id,
        price: 3500,
        unit: "шт",
        inStock: 20,
        minOrder: 1,
        isActive: true,
        rating: 4.6,
        reviewCount: 34
      }
    ]);

    console.log(`✅ Создано ${materials.length} базовых материалов`);
    return materials;

  } catch (error) {
    console.error("❌ Ошибка при создании материалов:", error);
    throw error;
  }
};

module.exports = { createBasicMaterials };
