const db = require('./app/models');
const bcrypt = require('bcryptjs');

/**
 * Восстановление базы данных с начальными данными
 */
async function restoreDatabase() {
  try {
    console.log("🔄 Восстановление базы данных...");
    
    // Подключаемся к базе данных
    await db.sequelize.authenticate();
    console.log("✅ Подключение к базе данных установлено");
    
    // Создаем пользователей
    console.log("👥 Создание пользователей...");
    
    const users = await db.user.bulkCreate([
      {
        username: 'test',
        email: 'test@example.com',
        password: bcrypt.hashSync('testtest', 8),
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        birthDate: '1990-01-01',
        cCoinBalance: 1000,
        isActive: true,
        role: 'user'
      },
      {
        username: 'test1',
        email: 'test1@example.com',
        password: bcrypt.hashSync('test1test1', 8),
        firstName: 'Test1',
        lastName: 'User1',
        phone: '+1234567891',
        birthDate: '1991-02-02',
        cCoinBalance: 1000,
        isActive: true,
        role: 'user'
      },
      {
        username: 'test2',
        email: 'test2@example.com',
        password: bcrypt.hashSync('test2test2', 8),
        firstName: 'Test2',
        lastName: 'User2',
        phone: '+1234567892',
        birthDate: '1992-03-03',
        cCoinBalance: 1000,
        isActive: true,
        role: 'user'
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: bcrypt.hashSync('adminadmin', 8),
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567893',
        birthDate: '1985-04-04',
        cCoinBalance: 10000,
        isActive: true,
        role: 'admin'
      }
    ]);
    
    console.log(`✅ Создано ${users.length} пользователей`);
    
    // Создаем 10 правильных категорий
    console.log("📂 Создание категорий...");
    
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
    
    // Создаем 10 правильных материалов
    console.log("🔨 Создание материалов...");
    
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
    
    // Создаем тестовые объявления от разных пользователей
    console.log("📢 Создание объявлений...");
    
    const advertisements = await db.advertisement.bulkCreate([
      {
        title: "Кирпич силикатный",
        description: "Качественный силикатный кирпич для строительства",
        materialId: materials[0].id,
        userId: users[0].id, // test
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
        userId: users[1].id, // test1
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
        userId: users[2].id, // test2
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
        userId: users[3].id, // admin
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
        userId: users[0].id, // test
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
    
    // Создаем несколько тестовых заказов
    console.log("📦 Создание заказов...");
    
    const orders = await db.order.bulkCreate([
      {
        userId: users[0].id, // test
        advertisementId: advertisements[1].id, // Стеновые блоки
        quantity: 50,
        totalPrice: 7000,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'c-coin',
        deliveryAddress: {
          city: 'Москва',
          street: 'Улица Тестовая',
          house: '123',
          apartment: '45'
        },
        orderDate: new Date(),
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через 7 дней
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: users[1].id, // test1
        advertisementId: advertisements[2].id, // Цемент М500
        quantity: 5,
        totalPrice: 22500,
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'c-coin',
        deliveryAddress: {
          city: 'Санкт-Петербург',
          street: 'Невский проспект',
          house: '1',
          apartment: '10'
        },
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 дня назад
        deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // через 5 дней
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]);
    
    console.log(`✅ Создано ${orders.length} заказов`);
    
    // Проверяем результат
    console.log("📊 Проверка результатов:");
    
    const userCount = await db.user.count();
    const categoryCount = await db.materialCategories.count();
    const materialCount = await db.material.count();
    const advertisementCount = await db.advertisement.count();
    const orderCount = await db.order.count();
    
    console.log(`👥 Пользователей: ${userCount}`);
    console.log(`📂 Категорий: ${categoryCount}`);
    console.log(`🔨 Материалов: ${materialCount}`);
    console.log(`📢 Объявлений: ${advertisementCount}`);
    console.log(`📦 Заказов: ${orderCount}`);
    
    // Показываем созданных пользователей
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
      ]
    });
    
    console.log("🔨 Созданные материалы:");
    createdMaterials.forEach(mat => {
      console.log(`- ${mat.name} (${mat.category.name}) - ${mat.price} ${mat.unit}`);
    });
    
    console.log("🎉 База данных успешно восстановлена!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при восстановлении базы данных:", error);
    process.exit(1);
  }
}

restoreDatabase();
