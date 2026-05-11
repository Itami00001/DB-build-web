const db = require('./app/models');

/**
 * Минимальное восстановление начальных данных для версии v1.4.1
 */
async function restoreV141Minimal() {
  try {
    console.log("🔄 Восстановление начальных данных для v1.4.1...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Создаем только основные таблицы
    console.log("📋 Создание основных таблиц...");
    
    // Создаем базовые таблицы
    await db.user.sync({ force: true });
    console.log("✅ Таблица users создана");
    
    await db.materialCategories.sync({ force: true });
    console.log("✅ Таблица materialCategories создана");
    
    await db.material.sync({ force: true });
    console.log("✅ Таблица materials создана");
    
    await db.advertisement.sync({ force: true });
    console.log("✅ Таблица advertisements создана");
    
    // Запускаем начальную загрузку данных (только пользователи, материалы, объявления)
    console.log("🚀 Запуск начальной загрузки данных...");
    
    // Создаем пользователей
    const bcrypt = require('bcryptjs');
    const users = await db.user.bulkCreate([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: bcrypt.hashSync('adminadmin', 8),
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890',
        birthDate: '1985-01-01',
        cCoinBalance: 10000,
        isActive: true,
        role: 'admin'
      },
      {
        username: 'user',
        email: 'user@example.com',
        password: bcrypt.hashSync('userpassword', 8),
        firstName: 'Regular',
        lastName: 'User',
        phone: '+1234567891',
        birthDate: '1990-01-01',
        cCoinBalance: 1000,
        isActive: true,
        role: 'user'
      },
      {
        username: 'seller',
        email: 'seller@example.com',
        password: bcrypt.hashSync('sellerpassword', 8),
        firstName: 'Seller',
        lastName: 'User',
        phone: '+1234567892',
        birthDate: '1988-01-01',
        cCoinBalance: 5000,
        isActive: true,
        role: 'user'
      },
      {
        username: 'buyer',
        email: 'buyer@example.com',
        password: bcrypt.hashSync('buyerpassword', 8),
        firstName: 'Buyer',
        lastName: 'User',
        phone: '+1234567893',
        birthDate: '1992-01-01',
        cCoinBalance: 2000,
        isActive: true,
        role: 'user'
      }
    ]);
    
    console.log(`✅ Создано ${users.length} пользователей`);
    
    // Создаем категории
    const categories = await db.materialCategories.bulkCreate([
      { name: "Кирпич", description: "Все виды кирпича", level: 1, isActive: true, sortOrder: 1, parentCategoryId: null },
      { name: "Блоки", description: "Стеновые блоки", level: 1, isActive: true, sortOrder: 2, parentCategoryId: null },
      { name: "Краски", description: "Краски и лакокрасочные материалы", level: 1, isActive: true, sortOrder: 3, parentCategoryId: null },
      { name: "Цемент", description: "Цемент и сухие смеси", level: 1, isActive: true, sortOrder: 4, parentCategoryId: null },
      { name: "Песок", description: "Песок и щебень", level: 1, isActive: true, sortOrder: 5, parentCategoryId: null },
      { name: "Арматура", description: "Арматура и металлопрокат", level: 1, isActive: true, sortOrder: 6, parentCategoryId: null },
      { name: "Утеплитель", description: "Теплоизоляционные материалы", level: 1, isActive: true, sortOrder: 7, parentCategoryId: null },
      { name: "Гидроизоляция", description: "Гидроизоляционные материалы", level: 1, isActive: true, sortOrder: 8, parentCategoryId: null },
      { name: "Кровля", description: "Кровельные материалы", level: 1, isActive: true, sortOrder: 9, parentCategoryId: null },
      { name: "Инструменты", description: "Строительные инструменты", level: 1, isActive: true, sortOrder: 10, parentCategoryId: null }
    ]);
    
    console.log(`✅ Создано ${categories.length} категорий`);
    
    // Создаем материалы
    const materials = await db.material.bulkCreate([
      { name: "Кирпич", description: "Строительный кирпич", categoryId: categories[0].id, price: 15.5, unit: "шт", inStock: 10000, minOrder: 100, isActive: true, rating: 4.5, reviewCount: 23 },
      { name: "Блоки", description: "Стеновые блоки", categoryId: categories[1].id, price: 125, unit: "шт", inStock: 500, minOrder: 10, isActive: true, rating: 4.7, reviewCount: 15 },
      { name: "Краски", description: "Лакокрасочные материалы", categoryId: categories[2].id, price: 280, unit: "л", inStock: 150, minOrder: 5, isActive: true, rating: 4.4, reviewCount: 19 },
      { name: "Цемент", description: "Цемент и сухие смеси", categoryId: categories[3].id, price: 4200, unit: "т", inStock: 80, minOrder: 1, isActive: true, rating: 4.7, reviewCount: 31 },
      { name: "Песок", description: "Песок и щебень", categoryId: categories[4].id, price: 450, unit: "м³", inStock: 50, minOrder: 5, isActive: true, rating: 4.3, reviewCount: 16 },
      { name: "Арматура", description: "Стальная арматура", categoryId: categories[5].id, price: 45, unit: "т", inStock: 50, minOrder: 0.5, isActive: true, rating: 4.3, reviewCount: 31 },
      { name: "Утеплитель", description: "Теплоизоляционные материалы", categoryId: categories[6].id, price: 850, unit: "м³", inStock: 30, minOrder: 1, isActive: true, rating: 4.8, reviewCount: 24 },
      { name: "Гидроизоляция", description: "Гидроизоляционные материалы", categoryId: categories[7].id, price: 280, unit: "м²", inStock: 500, minOrder: 15, isActive: true, rating: 4.5, reviewCount: 20 },
      { name: "Кровля", description: "Кровельные материалы", categoryId: categories[8].id, price: 320, unit: "м²", inStock: 1000, minOrder: 50, isActive: true, rating: 4.6, reviewCount: 27 },
      { name: "Инструменты", description: "Строительные инструменты", categoryId: categories[9].id, price: 3500, unit: "шт", inStock: 20, minOrder: 1, isActive: true, rating: 4.6, reviewCount: 34 }
    ]);
    
    console.log(`✅ Создано ${materials.length} материалов`);
    
    // Создаем тестовые объявления
    const advertisements = await db.advertisement.bulkCreate([
      {
        title: "Кирпич силикатный",
        description: "Качественный силикатный кирпич для строительства",
        materialId: materials[0].id,
        userId: users[2].id, // seller
        price: 18.5,
        quantity: 5000,
        unit: "шт",
        location: "Москва",
        contactPhone: "+74951234567",
        isActive: true,
        views: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Стеновые блоки",
        description: "Газобетонные блоки для строительства стен",
        materialId: materials[1].id,
        userId: users[2].id, // seller
        price: 140,
        quantity: 300,
        unit: "шт",
        location: "Санкт-Петербург",
        contactPhone: "+78121234567",
        isActive: true,
        views: 85,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Цемент М500",
        description: "Высококачественный цемент М500 для строительных работ",
        materialId: materials[3].id,
        userId: users[2].id, // seller
        price: 4500,
        quantity: 50,
        unit: "т",
        location: "Новосибирск",
        contactPhone: "+73831234567",
        isActive: true,
        views: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Строительная арматура",
        description: "Арматура А500С для фундаментов и железобетонных конструкций",
        materialId: materials[5].id,
        userId: users[2].id, // seller
        price: 48,
        quantity: 30,
        unit: "т",
        location: "Екатеринбург",
        contactPhone: "+73431234567",
        isActive: true,
        views: 150,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Утеплитель минеральная вата",
        description: "Эффективный утеплитель для стен и кровли",
        materialId: materials[6].id,
        userId: users[2].id, // seller
        price: 900,
        quantity: 25,
        unit: "м³",
        location: "Казань",
        contactPhone: "+78431234567",
        isActive: true,
        views: 95,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    console.log(`✅ Создано ${advertisements.length} объявлений`);
    
    console.log("🎉 Начальные данные для v1.4.1 успешно восстановлены!");
    
    // Проверяем результат
    const userCount = await db.user.count();
    const categoryCount = await db.materialCategories.count();
    const materialCount = await db.material.count();
    const advertisementCount = await db.advertisement.count();
    
    console.log("📊 Результат:");
    console.log(`👥 Пользователей: ${userCount}`);
    console.log(`📂 Категорий: ${categoryCount}`);
    console.log(`🔨 Материалов: ${materialCount}`);
    console.log(`📢 Объявлений: ${advertisementCount}`);
    
    // Показываем пользователей
    const createdUsers = await db.user.findAll({
      attributes: ['id', 'username', 'email', 'role', 'cCoinBalance']
    });
    
    console.log("👥 Созданные пользователи:");
    createdUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.role} - баланс: ${user.cCoinBalance} C`);
    });
    
    // Показываем материалы
    const createdMaterials = await db.material.findAll({
      include: [
        {
          model: db.materialCategories,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      limit: 10
    });
    
    console.log("🔨 Созданные материалы:");
    createdMaterials.forEach(mat => {
      console.log(`- ${mat.name} (${mat.category.name}) - ${mat.price} ${mat.unit}`);
    });
    
    // Показываем объявления
    const createdAdvertisements = await db.advertisement.findAll({
      include: [
        {
          model: db.user,
          as: 'user',
          attributes: ['username']
        },
        {
          model: db.material,
          as: 'material',
          attributes: ['name']
        }
      ],
      limit: 5
    });
    
    console.log("📢 Созданные объявления:");
    createdAdvertisements.forEach(ad => {
      console.log(`- ${ad.title} от ${ad.user.username} (${ad.material.name}) - ${ad.price} C`);
    });
    
    console.log("🔑 Данные для входа:");
    console.log("  admin / adminadmin");
    console.log("  user / userpassword");
    console.log("  seller / sellerpassword");
    console.log("  buyer / buyerpassword");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при восстановлении данных:", error);
    process.exit(1);
  }
}

restoreV141Minimal();
