const db = require("../models");

/**
 * Начальные материалы для строй-фирмы
 * Создает категории и строительные материалы
 */
const seedMaterials = async () => {
  try {
    console.log("Создание категорий материалов...");

    // Создаем категории материалов
    const categories = await db.materialCategories.bulkCreate([
      {
        name: "Стеновые материалы",
        description: "Материалы для возведения стен и перегородок",
        level: 1,
        isActive: true,
        sortOrder: 1
      },
      {
        name: "Кровельные материалы",
        description: "Материалы для устройства кровли",
        level: 1,
        isActive: true,
        sortOrder: 2
      },
      {
        name: "Отделочные материалы",
        description: "Материалы для внутренней и внешней отделки",
        level: 1,
        isActive: true,
        sortOrder: 3
      },
      {
        name: "Инженерные системы",
        description: "Материалы для инженерных коммуникаций",
        level: 1,
        isActive: true,
        sortOrder: 4
      },
      {
        name: "Фундаментные материалы",
        description: "Материалы для устройства фундамента",
        level: 1,
        isActive: true,
        sortOrder: 5
      },
      {
        name: "Изоляционные материалы",
        description: "Тепло-, гидро- и звукоизоляция",
        level: 1,
        isActive: true,
        sortOrder: 6
      }
    ]);

    console.log("Создание строительных материалов...");

    // Создаем строительные материалы
    const materials = await db.material.bulkCreate([
      // Стеновые материалы
      {
        name: "Кирпич силикатный одинарный",
        description: "Силикатный кирпич М-100, размер 250х120х65 мм. Идеален для строительства стен и перегородок.",
        categoryId: categories[0].id,
        price: 12.50,
        unit: "шт",
        inStock: 10000,
        minOrder: 100,
        image: "/images/materials/brick-silicate.jpg",
        specifications: {
          size: "250х120х65 мм",
          weight: "3.2 кг",
          strength: "М-100",
          frost_resistance: "F50",
          thermal_conductivity: "0.87 Вт/м·°С"
        },
        isActive: true,
        rating: 4.5,
        reviewCount: 23
      },
      {
        name: "Блок газобетонный",
        description: "Газобетонные блоки D600, размер 600х300х200 мм. Легкие и прочные стеновые блоки.",
        categoryId: categories[0].id,
        price: 85.00,
        unit: "м³",
        inStock: 500,
        minOrder: 1,
        image: "/images/materials/aerated-concrete.jpg",
        specifications: {
          size: "600х300х200 мм",
          density: "D600",
          strength: "B3.5",
          thermal_conductivity: "0.14 Вт/м·°С",
          weight: "22 кг/шт"
        },
        isActive: true,
        rating: 4.7,
        reviewCount: 18
      },
      {
        name: "Арматура стальная А500С",
        description: "Стальная арматура диаметром 12 мм, класс А500С. Для железобетонных конструкций.",
        categoryId: categories[0].id,
        price: 45.00,
        unit: "т",
        inStock: 50,
        minOrder: 0.5,
        image: "/images/materials/rebar.jpg",
        specifications: {
          diameter: "12 мм",
          class: "А500С",
          standard: "ГОСТ 52544-2006",
          weight: "0.888 кг/м",
          length: "11.7 м"
        },
        isActive: true,
        rating: 4.3,
        reviewCount: 31
      },

      // Кровельные материалы
      {
        name: "Черепица металлочерепица",
        description: "Металлочерепица Монтеррей, цвет коричневый. Гарантия 15 лет.",
        categoryId: categories[1].id,
        price: 320.00,
        unit: "м²",
        inStock: 1000,
        minOrder: 50,
        image: "/images/materials/metal-tile.jpg",
        specifications: {
          material: "Сталь 0.5 мм",
          coating: "Полимерный",
          color: "Коричневый",
          warranty: "15 лет",
          profile_height: "21 мм"
        },
        isActive: true,
        rating: 4.6,
        reviewCount: 27
      },
      {
        name: "Ондулин еврошифер",
        description: "Ондулин битумный шифер, цвет красный. Легкий и прочный кровельный материал.",
        categoryId: categories[1].id,
        price: 450.00,
        unit: "м²",
        inStock: 800,
        minOrder: 10,
        image: "/images/materials/ondulin.jpg",
        specifications: {
          material: "Органическое волокно + битум",
          thickness: "3 мм",
          length: "2000 мм",
          width: "950 мм",
          weight: "6.5 кг/лист"
        },
        isActive: true,
        rating: 4.2,
        reviewCount: 15
      },

      // Отделочные материалы
      {
        name: "Штукатурка гипсовая",
        description: "Сухая гипсовая штукатурка Knauf Rotband. Для внутренних работ.",
        categoryId: categories[2].id,
        price: 380.00,
        unit: "меш",
        inStock: 200,
        minOrder: 1,
        image: "/images/materials/plaster.jpg",
        specifications: {
          type: "Гипсовая",
          brand: "Knauf Rotband",
          weight: "30 кг/меш",
          consumption: "8.5 кг/м² при 10 мм",
          drying_time: "24 часа"
        },
        isActive: true,
        rating: 4.8,
        reviewCount: 42
      },
      {
        name: "Краска водоэмульсионная",
        description: "Водоэмульсионная краска для внутренних работ, белый цвет.",
        categoryId: categories[2].id,
        price: 280.00,
        unit: "л",
        inStock: 150,
        minOrder: 5,
        image: "/images/materials/paint.jpg",
        specifications: {
          type: "Водоэмульсионная",
          color: "Белый",
          consumption: "1 л/8-10 м²",
          drying_time: "2 часа",
          gloss: "Матовая"
        },
        isActive: true,
        rating: 4.4,
        reviewCount: 19
      },

      // Инженерные системы
      {
        name: "Труба водопроводная ПНД",
        description: "Полимерная труба для водопровода, диаметр 32 мм.",
        categoryId: categories[3].id,
        price: 65.00,
        unit: "м",
        inStock: 2000,
        minOrder: 10,
        image: "/images/materials/hdpe-pipe.jpg",
        specifications: {
          diameter: "32 мм",
          material: "ПНД",
          pressure: "PN16",
          length: "6 м",
          color: "Синий"
        },
        isActive: true,
        rating: 4.5,
        reviewCount: 22
      },
      {
        name: "Кабель ВВГнг 3х1.5",
        description: "Силовой кабель медный, 3 жилы по 1.5 мм². Для электропроводки.",
        categoryId: categories[3].id,
        price: 55.00,
        unit: "м",
        inStock: 1500,
        minOrder: 100,
        image: "/images/materials/cable.jpg",
        specifications: {
          type: "ВВГнг",
          cores: "3",
          cross_section: "1.5 мм²",
          voltage: "660В",
          insulation: "ПВХ"
        },
        isActive: true,
        rating: 4.6,
        reviewCount: 28
      },

      // Фундаментные материалы
      {
        name: "Бетон М200",
        description: "Готовый бетон М200 для фундаментов и стяжек. Под заказ.",
        categoryId: categories[4].id,
        price: 3200.00,
        unit: "м³",
        inStock: 100,
        minOrder: 1,
        image: "/images/materials/concrete.jpg",
        specifications: {
          class: "М200",
          mobility: "П2",
          frost_resistance: "F150",
          water_resistance: "W4",
          delivery: "Автобетоносмеситель"
        },
        isActive: true,
        rating: 4.7,
        reviewCount: 35
      },
      {
        name: "Песок строительный",
        description: "Песок строительный мытый, фракция 0-2 мм. Для бетона и растворов.",
        categoryId: categories[4].id,
        price: 450.00,
        unit: "м³",
        inStock: 50,
        minOrder: 5,
        image: "/images/materials/sand.jpg",
        specifications: {
          type: "Мытый",
          fraction: "0-2 мм",
          bulk_density: "1.6 т/м³",
          impurities: "<1%",
          moisture: "<5%"
        },
        isActive: true,
        rating: 4.3,
        reviewCount: 16
      },

      // Изоляционные материалы
      {
        name: "Утеплитель минеральная вата",
        description: "Минеральная вата Rockwool, толщина 100 мм. Для стен и перекрытий.",
        categoryId: categories[5].id,
        price: 850.00,
        unit: "м³",
        inStock: 30,
        minOrder: 1,
        image: "/images/materials/mineral-wool.jpg",
        specifications: {
          type: "Минеральная вата",
          brand: "Rockwool",
          thickness: "100 мм",
          thermal_conductivity: "0.036 Вт/м·°С",
          fire_class: "НГ"
        },
        isActive: true,
        rating: 4.8,
        reviewCount: 24
      },
      {
        name: "Гидроизоляция Технониколь",
        description: "Рулонная гидроизоляция Технониколь, 1.5 мм. Для фундаментов и кровли.",
        categoryId: categories[5].id,
        price: 280.00,
        unit: "м²",
        inStock: 500,
        minOrder: 15,
        image: "/images/materials/waterproofing.jpg",
        specifications: {
          type: "Рулонная",
          brand: "Технониколь",
          thickness: "1.5 мм",
          width: "1000 мм",
          length: "10 м"
        },
        isActive: true,
        rating: 4.5,
        reviewCount: 20
      },

      // Дополнительные стеновые материалы
      {
        name: "Блок керамзитобетонный",
        description: "Керамзитобетонные блоки, размер 390х190х188 мм. Легкие и теплые стеновые блоки.",
        categoryId: categories[0].id,
        price: 95.00,
        unit: "шт",
        inStock: 2000,
        minOrder: 50,
        image: "/images/materials/ceramic-block.jpg",
        specifications: {
          size: "390х190х188 мм",
          weight: "17 кг",
          strength: "М-75",
          thermal_conductivity: "0.26 Вт/м·°С",
          density: "1200 кг/м³"
        },
        isActive: true,
        rating: 4.4,
        reviewCount: 12
      },
      {
        name: "Пеноблок",
        description: "Пеноблоки D500, размер 600х300х200 мм. Отличные теплоизоляционные свойства.",
        categoryId: categories[0].id,
        price: 75.00,
        unit: "м³",
        inStock: 300,
        minOrder: 1,
        image: "/images/materials/foam-block.jpg",
        specifications: {
          size: "600х300х200 мм",
          density: "D500",
          strength: "B2.5",
          thermal_conductivity: "0.12 Вт/м·°С",
          weight: "18 кг/шт"
        },
        isActive: true,
        rating: 4.6,
        reviewCount: 19
      },

      // Дополнительные кровельные материалы
      {
        name: "Профнастил оцинкованный",
        description: "Профнастил С-21, оцинкованный. Для заборов и кровель.",
        categoryId: categories[1].id,
        price: 180.00,
        unit: "м²",
        inStock: 1500,
        minOrder: 20,
        image: "/images/materials/profiled-sheet.jpg",
        specifications: {
          material: "Сталь 0.5 мм",
          coating: "Цинк",
          height: "21 мм",
          width: "1000 мм",
          length: "6 м"
        },
        isActive: true,
        rating: 4.3,
        reviewCount: 25
      },
      {
        name: "Гибкая черепица",
        description: "Гибкая битумная черепица, цвет красный. Гарантия 20 лет.",
        categoryId: categories[1].id,
        price: 420.00,
        unit: "м²",
        inStock: 800,
        minOrder: 30,
        image: "/images/materials/flexible-tile.jpg",
        specifications: {
          material: "Битум",
          color: "Красный",
          thickness: "3 мм",
          warranty: "20 лет",
          size: "1000х333 мм"
        },
        isActive: true,
        rating: 4.7,
        reviewCount: 33
      },

      // Дополнительные отделочные материалы
      {
        name: "Сухая смесь для стяжки",
        description: "Сухая смесь для стяжки пола M-150. Для выравнивания полов.",
        categoryId: categories[2].id,
        price: 290.00,
        unit: "меш",
        inStock: 150,
        minOrder: 1,
        image: "/images/materials/floor-mix.jpg",
        specifications: {
          type: "Цементная",
          brand: "M-150",
          weight: "50 кг/меш",
          consumption: "15 кг/м² при 20 мм",
          drying_time: "48 часов"
        },
        isActive: true,
        rating: 4.5,
        reviewCount: 28
      },
      {
        name: "Грунтовка акриловая",
        description: "Грунтовка акриловая универсальная. Для внутренних и наружных работ.",
        categoryId: categories[2].id,
        price: 180.00,
        unit: "л",
        inStock: 200,
        minOrder: 10,
        image: "/images/materials/primer.jpg",
        specifications: {
          type: "Акриловая",
          consumption: "1 л/8-12 м²",
          drying_time: "1 час",
          color: "Бесцветная",
          volume: "10 л"
        },
        isActive: true,
        rating: 4.4,
        reviewCount: 21
      },

      // Дополнительные инженерные системы
      {
        name: "Фитинг ПНД компрессионный",
        description: "Компрессионный фитинг для ПНД труб, диаметр 32 мм.",
        categoryId: categories[3].id,
        price: 85.00,
        unit: "шт",
        inStock: 500,
        minOrder: 10,
        image: "/images/materials/hdpe-fitting.jpg",
        specifications: {
          diameter: "32 мм",
          material: "ПНД",
          type: "Компрессионный",
          pressure: "PN16",
          color: "Черный"
        },
        isActive: true,
        rating: 4.3,
        reviewCount: 16
      },
      {
        name: "Автоматический выключатель",
        description: "Автоматический выключатель 1П, 16А, характеристика C. Для защиты электропроводки.",
        categoryId: categories[3].id,
        price: 120.00,
        unit: "шт",
        inStock: 300,
        minOrder: 5,
        image: "/images/materials/circuit-breaker.jpg",
        specifications: {
          poles: "1П",
          current: "16А",
          characteristic: "C",
          voltage: "230/400В",
          brand: "IEK"
        },
        isActive: true,
        rating: 4.6,
        reviewCount: 29
      },

      // Дополнительные фундаментные материалы
      {
        name: "Щебень гранитный",
        description: "Щебень гранитный фракция 20-40 мм. Для бетона и дорожного строительства.",
        categoryId: categories[4].id,
        price: 1200.00,
        unit: "м³",
        inStock: 100,
        minOrder: 5,
        image: "/images/materials/crushed-stone.jpg",
        specifications: {
          type: "Гранитный",
          fraction: "20-40 мм",
          strength: "М-1200",
          bulk_density: "1.45 т/м³",
          frost_resistance: "F300"
        },
        isActive: true,
        rating: 4.5,
        reviewCount: 22
      },
      {
        name: "Цемент М500",
        description: "Цемент портландский М500 Д0. Для высокопрочного бетона.",
        categoryId: categories[4].id,
        price: 4200.00,
        unit: "т",
        inStock: 80,
        minOrder: 1,
        image: "/images/materials/cement.jpg",
        specifications: {
          type: "Портландский",
          class: "М500",
          additive: "Д0",
          setting_time: "45 мин",
          strength_28d: "50 МПа"
        },
        isActive: true,
        rating: 4.7,
        reviewCount: 31
      },

      // Дополнительные изоляционные материалы
      {
        name: "Пеноплекс экструдированный",
        description: "Пеноплекс экструдированный, толщина 50 мм. Для фундамента и стен.",
        categoryId: categories[5].id,
        price: 550.00,
        unit: "м³",
        inStock: 40,
        minOrder: 1,
        image: "/images/materials/penoplex.jpg",
        specifications: {
          type: "Экструдированный",
          brand: "Пеноплекс",
          thickness: "50 мм",
          thermal_conductivity: "0.03 Вт/м·°С",
          density: "35 кг/м³"
        },
        isActive: true,
        rating: 4.8,
        reviewCount: 26
      },
      {
        name: "Пароизоляция пленка",
        description: "Пароизоляционная пленка, толщина 150 мкм. Для защиты от конденсата.",
        categoryId: categories[5].id,
        price: 35.00,
        unit: "м²",
        inStock: 1000,
        minOrder: 50,
        image: "/images/materials/vapor-barrier.jpg",
        specifications: {
          type: "Пленка",
          thickness: "150 мкм",
          width: "1500 мм",
          length: "50 м",
          density: "1.2 г/см³"
        },
        isActive: true,
        rating: 4.2,
        reviewCount: 18
      },

      // Инструменты и крепеж
      {
        name: "Перфоратор SDS-Plus",
        description: "Перфоратор SDS-Plus, 800Вт. Для сверления бетона и кирпича.",
        categoryId: categories[3].id,
        price: 3500.00,
        unit: "шт",
        inStock: 20,
        minOrder: 1,
        image: "/images/materials/rotary-hammer.jpg",
        specifications: {
          power: "800Вт",
          chuck: "SDS-Plus",
          impact_energy: "2.5 Дж",
          speed: "0-1500 об/мин",
          brand: "Bosch"
        },
        isActive: true,
        rating: 4.6,
        reviewCount: 34
      },
      {
        name: "Анкер-клей",
        description: "Анкер-клей для крепления тяжелых конструкций. 25 кг мешок.",
        categoryId: categories[3].id,
        price: 420.00,
        unit: "меш",
        inStock: 80,
        minOrder: 2,
        image: "/images/materials/anchor-glue.jpg",
        specifications: {
          type: "Анкер-клей",
          weight: "25 кг/меш",
          consumption: "8 кг/м²",
          setting_time: "24 часа",
          strength: "30 МПа"
        },
        isActive: true,
        rating: 4.5,
        reviewCount: 27
      },

      // Отделочные материалы
      {
        name: "Керамическая плитка",
        description: "Керамическая плитка для пола, размер 30х30 см. Глянцевая.",
        categoryId: categories[2].id,
        price: 380.00,
        unit: "м²",
        inStock: 500,
        minOrder: 10,
        image: "/images/materials/ceramic-tile.jpg",
        specifications: {
          size: "30х30 см",
          type: "Напольная",
          surface: "Глянцевая",
          thickness: "8 мм",
          color: "Белый"
        },
        isActive: true,
        rating: 4.4,
        reviewCount: 23
      },
      {
        name: "Плиточный клей",
        description: "Плиточный клей для керамической плитки. 25 кг мешок.",
        categoryId: categories[2].id,
        price: 320.00,
        unit: "меш",
        inStock: 120,
        minOrder: 2,
        image: "/images/materials/tile-adhesive.jpg",
        specifications: {
          type: "Плиточный клей",
          weight: "25 кг/меш",
          consumption: "4 кг/м²",
          setting_time: "24 часа",
          open_time: "3 часа"
        },
        isActive: true,
        rating: 4.6,
        reviewCount: 30
      }
    ]);

    console.log(`✅ Создано ${categories.length} категорий и ${materials.length} материалов`);
    return { categories, materials };

  } catch (error) {
    console.error("❌ Ошибка при создании материалов:", error);
    throw error;
  }
};

module.exports = { seedMaterials };
