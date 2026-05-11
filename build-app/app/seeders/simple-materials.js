const db = require("../models");

/**
 * Создание простых материалов
 * Создает базовые материалы для каждой категории
 */
const createSimpleMaterials = async () => {
  try {
    console.log("Создание простых материалов...");

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

    // Создаем простые материалы для каждой категории
    const materials = await db.material.bulkCreate([
      // Кирпич
      {
        name: "Кирпич силикатный",
        description: "Стандартный силикатный кирпич",
        categoryId: categories.find(c => c.name === "Кирпич")?.id,
        price: 15.5,
        unit: "шт",
        inStock: 10000,
        minOrder: 100,
        isActive: true,
        rating: 4.5,
        reviewCount: 23
      },
      {
        name: "Кирпич керамический",
        description: "Стандартный керамический кирпич",
        categoryId: categories.find(c => c.name === "Кирпич")?.id,
        price: 12.0,
        unit: "шт",
        inStock: 8000,
        minOrder: 100,
        isActive: true,
        rating: 4.3,
        reviewCount: 18
      },

      // Блоки
      {
        name: "Блок газобетонный",
        description: "Газобетонные блоки D600",
        categoryId: categories.find(c => c.name === "Блоки")?.id,
        price: 125,
        unit: "шт",
        inStock: 500,
        minOrder: 10,
        isActive: true,
        rating: 4.7,
        reviewCount: 15
      },
      {
        name: "Блок пенобетонный",
        description: "Пенобетонные блоки D500",
        categoryId: categories.find(c => c.name === "Блоки")?.id,
        price: 95,
        unit: "шт",
        inStock: 300,
        minOrder: 10,
        isActive: true,
        rating: 4.4,
        reviewCount: 12
      },

      // Краски
      {
        name: "Краска водоэмульсионная",
        description: "Водоэмульсионная краска для внутренних работ",
        categoryId: categories.find(c => c.name === "Краски")?.id,
        price: 280,
        unit: "л",
        inStock: 150,
        minOrder: 5,
        isActive: true,
        rating: 4.4,
        reviewCount: 19
      },
      {
        name: "Краска фасадная",
        description: "Фасадная краска для наружных работ",
        categoryId: categories.find(c => c.name === "Краски")?.id,
        price: 450,
        unit: "л",
        inStock: 200,
        minOrder: 5,
        isActive: true,
        rating: 4.6,
        reviewCount: 14
      },

      // Цемент
      {
        name: "Цемент М500",
        description: "Портландский цемент М500",
        categoryId: categories.find(c => c.name === "Цемент")?.id,
        price: 4200,
        unit: "т",
        inStock: 80,
        minOrder: 1,
        isActive: true,
        rating: 4.7,
        reviewCount: 31
      },
      {
        name: "Сухая смесь",
        description: "Сухая строительная смесь",
        categoryId: categories.find(c => c.name === "Цемент")?.id,
        price: 290,
        unit: "меш",
        inStock: 150,
        minOrder: 1,
        isActive: true,
        rating: 4.5,
        reviewCount: 22
      },

      // Песок
      {
        name: "Песок строительный",
        description: "Строительный песок фракции 0-2 мм",
        categoryId: categories.find(c => c.name === "Песок")?.id,
        price: 450,
        unit: "м³",
        inStock: 50,
        minOrder: 5,
        isActive: true,
        rating: 4.3,
        reviewCount: 16
      },
      {
        name: "Щебень гранитный",
        description: "Гранитный щебень фракции 20-40 мм",
        categoryId: categories.find(c => c.name === "Песок")?.id,
        price: 1200,
        unit: "м³",
        inStock: 100,
        minOrder: 5,
        isActive: true,
        rating: 4.5,
        reviewCount: 20
      },

      // Арматура
      {
        name: "Арматура 12 мм",
        description: "Стальная арматура А500С диаметром 12 мм",
        categoryId: categories.find(c => c.name === "Арматура")?.id,
        price: 45,
        unit: "т",
        inStock: 50,
        minOrder: 0.5,
        isActive: true,
        rating: 4.3,
        reviewCount: 31
      },
      {
        name: "Арматура 8 мм",
        description: "Стальная арматура А500С диаметром 8 мм",
        categoryId: categories.find(c => c.name === "Арматура")?.id,
        price: 48,
        unit: "т",
        inStock: 40,
        minOrder: 0.5,
        isActive: true,
        rating: 4.4,
        reviewCount: 25
      },

      // Утеплитель
      {
        name: "Минеральная вата",
        description: "Минеральная вата Rockwool",
        categoryId: categories.find(c => c.name === "Утеплитель")?.id,
        price: 850,
        unit: "м³",
        inStock: 30,
        minOrder: 1,
        isActive: true,
        rating: 4.8,
        reviewCount: 24
      },
      {
        name: "Пеноплекс",
        description: "Экструдированный пенополистирол",
        categoryId: categories.find(c => c.name === "Утеплитель")?.id,
        price: 550,
        unit: "м³",
        inStock: 40,
        minOrder: 1,
        isActive: true,
        rating: 4.8,
        reviewCount: 26
      },

      // Гидроизоляция
      {
        name: "Гидроизоляция рулонная",
        description: "Рулонная гидроизоляция Технониколь",
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
        name: "Металлочерепица",
        description: "Металлочерепица Монтеррей",
        categoryId: categories.find(c => c.name === "Кровля")?.id,
        price: 320,
        unit: "м²",
        inStock: 1000,
        minOrder: 50,
        isActive: true,
        rating: 4.6,
        reviewCount: 27
      },
      {
        name: "Ондулин",
        description: "Битумный шифер Ондулин",
        categoryId: categories.find(c => c.name === "Кровля")?.id,
        price: 450,
        unit: "м²",
        inStock: 800,
        minOrder: 10,
        isActive: true,
        rating: 4.2,
        reviewCount: 15
      },

      // Инструменты
      {
        name: "Перфоратор",
        description: "Перфоратор SDS-Plus 800Вт",
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

    console.log(`✅ Создано ${materials.length} простых материалов`);
    return materials;

  } catch (error) {
    console.error("❌ Ошибка при создании материалов:", error);
    throw error;
  }
};

module.exports = { createSimpleMaterials };
