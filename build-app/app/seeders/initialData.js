const db = require("../models");
const bcrypt = require("bcryptjs");

module.exports = async () => {
  try {
    // Create users
    const users = [
      {
        username: 'admin',
        email: 'admin@gmail.com',
        password: bcrypt.hashSync('adminadmin', 8),
        firstName: 'Admin',
        lastName: 'User',
        phone: '+79991234567',
        birthDate: '1990-01-01',
        role: 'admin',
        cCoinBalance: 1000.00,
        isActive: true
      },
      {
        username: 'test',
        email: 'test@gmail.com',
        password: bcrypt.hashSync('testtest', 8),
        firstName: 'Test',
        lastName: 'User',
        phone: '+79992345678',
        birthDate: '1992-05-15',
        role: 'user',
        cCoinBalance: 100.00,
        isActive: true
      },
      {
        username: 'test1',
        email: 'test1@gmail.com',
        password: bcrypt.hashSync('test1test1', 8),
        firstName: 'Test1',
        lastName: 'User',
        phone: '+79993456789',
        birthDate: '1993-08-20',
        role: 'user',
        cCoinBalance: 50.00,
        isActive: true
      },
      {
        username: 'test2',
        email: 'test2@gmail.com',
        password: bcrypt.hashSync('test2test2', 8),
        firstName: 'Test2',
        lastName: 'User',
        phone: '+79994567890',
        birthDate: '1994-12-10',
        role: 'user',
        cCoinBalance: 75.00,
        isActive: true
      }
    ];

    for (const userData of users) {
      await db.user.findOrCreate({
        where: { username: userData.username },
        defaults: userData
      });
    }

    // Create material categories
    const categories = [
      {
        name: 'Стеновые материалы',
        description: 'Материалы для строительства стен',
        parentCategoryId: null,
        level: 1,
        sortOrder: 1
      },
      {
        name: 'Кровельные материалы',
        description: 'Материалы для кровельных работ',
        parentCategoryId: null,
        level: 1,
        sortOrder: 2
      },
      {
        name: 'Отделочные материалы',
        description: 'Материалы для отделочных работ',
        parentCategoryId: null,
        level: 1,
        sortOrder: 3
      },
      {
        name: 'Инженерные системы',
        description: 'Системы инженерного оборудования',
        parentCategoryId: null,
        level: 1,
        sortOrder: 4
      },
      {
        name: 'Кирпич',
        description: 'Различные виды кирпича',
        parentCategoryId: null,
        level: 2,
        sortOrder: 1
      },
      {
        name: 'Блоки',
        description: 'Строительные блоки',
        parentCategoryId: null,
        level: 2,
        sortOrder: 2
      },
      {
        name: 'Черепица',
        description: 'Кровельная черепица',
        parentCategoryId: null,
        level: 2,
        sortOrder: 1
      },
      {
        name: 'Краски',
        description: 'Краски и лакокрасочные материалы',
        parentCategoryId: null,
        level: 2,
        sortOrder: 1
      },
      {
        name: 'Обои',
        description: 'Обои для стен',
        parentCategoryId: null,
        level: 2,
        sortOrder: 2
      }
    ];

    for (const categoryData of categories) {
      await db.materialCategories.findOrCreate({
        where: { name: categoryData.name },
        defaults: categoryData
      });
    }

    // Update parent-child relationships
    const wallCategory = await db.materialCategories.findOne({ where: { name: 'Стеновые материалы' } });
    const brickCategory = await db.materialCategories.findOne({ where: { name: 'Кирпич' } });
    const blocksCategory = await db.materialCategories.findOne({ where: { name: 'Блоки' } });
    const roofCategory = await db.materialCategories.findOne({ where: { name: 'Кровельные материалы' } });
    const tilesCategory = await db.materialCategories.findOne({ where: { name: 'Черепица' } });
    const finishCategory = await db.materialCategories.findOne({ where: { name: 'Отделочные материалы' } });
    const paintsCategory = await db.materialCategories.findOne({ where: { name: 'Краски' } });
    const wallpapersCategory = await db.materialCategories.findOne({ where: { name: 'Обои' } });

    if (wallCategory && brickCategory) {
      await brickCategory.update({ parentCategoryId: wallCategory.id, level: 2 });
    }
    if (wallCategory && blocksCategory) {
      await blocksCategory.update({ parentCategoryId: wallCategory.id, level: 2 });
    }
    if (roofCategory && tilesCategory) {
      await tilesCategory.update({ parentCategoryId: roofCategory.id, level: 2 });
    }
    if (finishCategory && paintsCategory) {
      await paintsCategory.update({ parentCategoryId: finishCategory.id, level: 2 });
    }
    if (finishCategory && wallpapersCategory) {
      await wallpapersCategory.update({ parentCategoryId: finishCategory.id, level: 2 });
    }

    // Create materials
    const materials = [
      {
        name: 'Кирпич силикатный одинарный',
        description: 'Силикатный кирпич М-100, размер 250х120х65 мм',
        categoryId: brickCategory ? brickCategory.id : 5,
        price: 15.50,
        unit: 'шт',
        inStock: 10000,
        minOrder: 100,
        image: 'https://example.com/brick1.jpg',
        specifications: {
          size: '250х120х65 мм',
          weight: '3.2 кг',
          strength: 'М-100',
          frost_resistance: 'F50'
        }
      },
      {
        name: 'Кирпич красный полнотелый',
        description: 'Керамический полнотелый кирпич М-150',
        categoryId: brickCategory ? brickCategory.id : 5,
        price: 18.75,
        unit: 'шт',
        inStock: 8000,
        minOrder: 100,
        image: 'https://example.com/brick2.jpg',
        specifications: {
          size: '250х120х65 мм',
          weight: '3.5 кг',
          strength: 'М-150',
          frost_resistance: 'F75'
        }
      },
      {
        name: 'Блок газобетонный',
        description: 'Газобетонный блок D600, размер 600х300х200 мм',
        categoryId: blocksCategory ? blocksCategory.id : 6,
        price: 125.00,
        unit: 'шт',
        inStock: 500,
        minOrder: 10,
        image: 'https://example.com/block1.jpg',
        specifications: {
          size: '600х300х200 мм',
          weight: '18 кг',
          density: 'D600',
          strength: 'B3.5'
        }
      },
      {
        name: 'Черепица металлическая',
        description: 'Металлочерепица полиэстер, цвет коричневый',
        categoryId: tilesCategory ? tilesCategory.id : 7,
        price: 280.00,
        unit: 'м²',
        inStock: 1000,
        minOrder: 5,
        image: 'https://example.com/tile1.jpg',
        specifications: {
          thickness: '0.45 мм',
          coating: 'Полиэстер',
          color: 'Коричневый',
          warranty: '15 лет'
        }
      },
      {
        name: 'Краска водно-дисперсионная',
        description: 'Водно-дисперсионная краска для внутренних работ',
        categoryId: paintsCategory ? paintsCategory.id : 8,
        price: 450.00,
        unit: 'л',
        inStock: 200,
        minOrder: 1,
        image: 'https://example.com/paint1.jpg',
        specifications: {
          volume: '10 л',
          consumption: '8-10 м²/л',
          drying_time: '2 часа',
          layers: '2-3'
        }
      },
      {
        name: 'Обои виниловые',
        description: 'Виниловые обои на флизелиновой основе',
        categoryId: wallpapersCategory ? wallpapersCategory.id : 9,
        price: 850.00,
        unit: 'рул',
        inStock: 50,
        minOrder: 1,
        image: 'https://example.com/wallpaper1.jpg',
        specifications: {
          width: '53 см',
          length: '10 м',
          pattern_repeat: '64 см',
          washing_class: 'Стойкая к мытью'
        }
      }
    ];

    for (const materialData of materials) {
      await db.material.findOrCreate({
        where: { name: materialData.name },
        defaults: materialData
      });
    }

    // Create some sample advertisements
    const testUser = await db.user.findOne({ where: { username: 'test' } });
    const test1User = await db.user.findOne({ where: { username: 'test1' } });
    const brickMaterial = await db.material.findOne({ where: { name: 'Кирпич силикатный одинарный' } });
    const blockMaterial = await db.material.findOne({ where: { name: 'Блок газобетонный' } });
    const paintMaterial = await db.material.findOne({ where: { name: 'Краска водно-дисперсионная' } });

    if (testUser && brickMaterial) {
      await db.advertisement.findOrCreate({
        where: { 
          userId: testUser.id, 
          materialId: brickMaterial.id,
          title: 'Продам кирпич силикатный'
        },
        defaults: {
          title: 'Продам кирпич силикатный',
          description: 'Продаю качественный силикатный кирпич М-100. Все документы в наличии. Возможна доставка.',
          userId: testUser.id,
          materialId: brickMaterial.id,
          price: 14.50,
          quantity: 5000,
          location: 'Москва',
          images: ['https://example.com/brick_ad1.jpg'],
          contactInfo: {
            phone: '+79992345678',
            email: 'test@gmail.com'
          },
          status: 'active'
        }
      });
    }

    if (test1User && blockMaterial) {
      await db.advertisement.findOrCreate({
        where: { 
          userId: test1User.id, 
          materialId: blockMaterial.id,
          title: 'Газобетонные блоки D600'
        },
        defaults: {
          title: 'Газобетонные блоки D600',
          description: 'Газобетонные блоки D600, отличное качество. Остатки с объекта. Цена negociable.',
          userId: test1User.id,
          materialId: blockMaterial.id,
          price: 110.00,
          quantity: 200,
          location: 'Санкт-Петербург',
          images: ['https://example.com/block_ad1.jpg'],
          contactInfo: {
            phone: '+79993456789',
            email: 'test1@gmail.com'
          },
          status: 'active'
        }
      });
    }

    if (testUser && paintMaterial) {
      await db.advertisement.findOrCreate({
        where: { 
          userId: testUser.id, 
          materialId: paintMaterial.id,
          title: 'Краска водно-дисперсионная белая'
        },
        defaults: {
          title: 'Краска водно-дисперсионная белая',
          description: 'Продам остатки краски после ремонта. Оригинальная упаковка. Срок годности до 2025 года.',
          userId: testUser.id,
          materialId: paintMaterial.id,
          price: 350.00,
          quantity: 15,
          location: 'Москва',
          images: ['https://example.com/paint_ad1.jpg'],
          contactInfo: {
            phone: '+79992345678',
            email: 'test@gmail.com'
          },
          status: 'active'
        }
      });
    }

    console.log('Initial data created successfully');
  } catch (error) {
    console.error('Error creating initial data:', error);
  }
};
