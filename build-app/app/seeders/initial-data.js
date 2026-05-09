const bcrypt = require('bcryptjs');
const db = require('../models');

/**
 * Начальные данные для базы данных
 * Создает пользователей, категории, материалы и объявления
 */

async function seedInitialData() {
  try {
    console.log('Начинаем создание начальных данных...');

    // Создание пользователей
    const users = await createUsers();
    
    // Создание категорий материалов
    const categories = await createMaterialCategories();
    
    // Создание материалов
    const materials = await createMaterials(categories);
    
    // Создание объявлений
    await createAdvertisements(users, materials);
    
    // Создание начальных транзакций
    await createInitialTransactions(users);

    console.log('Начальные данные успешно созданы!');
  } catch (error) {
    console.error('Ошибка при создании начальных данных:', error);
    throw error;
  }
}

async function createUsers() {
  console.log('Создание пользователей...');
  
  const hashedPassword = await bcrypt.hash('testtest', 10);
  const hashedPassword1 = await bcrypt.hash('test1test1', 10);
  const hashedPassword2 = await bcrypt.hash('test2test2', 10);
  const adminPassword = await bcrypt.hash('adminadmin', 10);

  const users = await db.user.bulkCreate([
    {
      username: 'test',
      email: 'test@gmail.com',
      password: hashedPassword,
      firstName: 'Иван',
      lastName: 'Петров',
      phone: '+71234567890',
      birthDate: '1990-01-01',
      role: 'user',
      cCoinBalance: 100.00
    },
    {
      username: 'test1',
      email: 'test1@gmail.com',
      password: hashedPassword1,
      firstName: 'Петр',
      lastName: 'Иванов',
      phone: '+72345678901',
      birthDate: '1985-05-15',
      role: 'user',
      cCoinBalance: 50.00
    },
    {
      username: 'test2',
      email: 'test2@gmail.com',
      password: hashedPassword2,
      firstName: 'Сидор',
      lastName: 'Сидоров',
      phone: '+73456789012',
      birthDate: '1992-10-20',
      role: 'user',
      cCoinBalance: 75.00
    },
    {
      username: 'admin',
      email: 'admin@gmail.com',
      password: adminPassword,
      firstName: 'Админ',
      lastName: 'Админов',
      phone: '+71112223344',
      birthDate: '1980-01-01',
      role: 'admin',
      cCoinBalance: 1000.00
    }
  ]);

  console.log(`Создано ${users.length} пользователей`);
  return users;
}

async function createMaterialCategories() {
  console.log('Создание категорий материалов...');
  
  const categories = await db.materialCategories.bulkCreate([
    {
      name: 'Кирпич',
      description: 'Различные виды кирпича для строительства',
      level: 1,
      sortOrder: 1
    },
    {
      name: 'Блоки',
      description: 'Строительные блоки и газобетон',
      level: 1,
      sortOrder: 2
    },
    {
      name: 'Краски',
      description: 'Краски и лакокрасочные материалы',
      level: 1,
      sortOrder: 3
    },
    {
      name: 'Цемент',
      description: 'Цемент и строительные смеси',
      level: 1,
      sortOrder: 4
    },
    {
      name: 'Песок',
      description: 'Песок и щебень',
      level: 1,
      sortOrder: 5
    },
    {
      name: 'Металлопрокат',
      description: 'Арматура и металлические изделия',
      level: 1,
      sortOrder: 6
    },
    {
      name: 'Утеплители',
      description: 'Материалы для утепления',
      level: 1,
      sortOrder: 7
    },
    {
      name: 'Кровля',
      description: 'Кровельные материалы',
      level: 1,
      sortOrder: 8
    }
  ]);

  console.log(`Создано ${categories.length} категорий`);
  return categories;
}

async function createMaterials(categories) {
  console.log('Создание материалов...');
  
  const materials = await db.material.bulkCreate([
    {
      name: 'Кирпич силикатный одинарный',
      description: 'Силикатный кирпич М-100, размер 250х120х65 мм',
      categoryId: categories[0].id,
      price: 15.50,
      unit: 'шт',
      inStock: 10000,
      minOrder: 100,
      rating: 4.5,
      reviewCount: 12
    },
    {
      name: 'Блок газобетонный',
      description: 'Газобетонный блок D600, размер 600х300х200 мм',
      categoryId: categories[1].id,
      price: 125.00,
      unit: 'шт',
      inStock: 500,
      minOrder: 10,
      rating: 4.8,
      reviewCount: 8
    },
    {
      name: 'Краска водно-дисперсионная',
      description: 'Водно-дисперсионная краска для внутренних работ',
      categoryId: categories[2].id,
      price: 450.00,
      unit: 'л',
      inStock: 200,
      minOrder: 1,
      rating: 4.2,
      reviewCount: 15
    },
    {
      name: 'Цемент М-500',
      description: 'Портландцемент М-500 в мешках по 50 кг',
      categoryId: categories[3].id,
      price: 320.00,
      unit: 'мешок',
      inStock: 100,
      minOrder: 1,
      rating: 4.6,
      reviewCount: 20
    },
    {
      name: 'Песок речной',
      description: 'Песок речной мытый, фракция 0-2 мм',
      categoryId: categories[4].id,
      price: 800.00,
      unit: 'м³',
      inStock: 50,
      minOrder: 1,
      rating: 4.3,
      reviewCount: 6
    },
    {
      name: 'Арматура А-500',
      description: 'Арматура стальная А-500 диаметр 12 мм',
      categoryId: categories[5].id,
      price: 45.00,
      unit: 'м',
      inStock: 1000,
      minOrder: 10,
      rating: 4.7,
      reviewCount: 9
    },
    {
      name: 'Минеральная вата',
      description: 'Утеплитель минеральная вата 100 мм',
      categoryId: categories[6].id,
      price: 1200.00,
      unit: 'м²',
      inStock: 100,
      minOrder: 5,
      rating: 4.4,
      reviewCount: 11
    },
    {
      name: 'Черепица металлическая',
      description: 'Металлочерепица профилированная, цвет коричневый',
      categoryId: categories[7].id,
      price: 350.00,
      unit: 'м²',
      inStock: 200,
      minOrder: 10,
      rating: 4.5,
      reviewCount: 7
    }
  ]);

  console.log(`Создано ${materials.length} материалов`);
  return materials;
}

async function createAdvertisements(users, materials) {
  console.log('Создание объявлений...');
  
  const advertisements = await db.advertisement.bulkCreate([
    {
      title: 'Продам кирпич силикатный',
      description: 'Качественный силикатный кирпич по низкой цене. Возможна доставка.',
      materialId: materials[0].id,
      userId: users[0].id,
      price: 14.50,
      quantity: 5000,
      status: 'active',
      location: 'Москва',
      featured: true
    },
    {
      title: 'Газобетонные блоки с доставкой',
      description: 'Газобетонные блоки D600, отличное качество. Работаем с физическими и юридическими лицами.',
      materialId: materials[1].id,
      userId: users[1].id,
      price: 120.00,
      quantity: 200,
      status: 'active',
      location: 'Санкт-Петербург',
      featured: true
    },
    {
      title: 'Водно-дисперсионная краска',
      description: 'Краска высокого качества для внутренних и наружных работ. Все цвета в наличии.',
      materialId: materials[2].id,
      userId: users[2].id,
      price: 440.00,
      quantity: 50,
      status: 'active',
      location: 'Екатеринбург'
    },
    {
      title: 'Цемент М-500 оптом',
      description: 'Цемент М-500 от производителя. Сертификаты качества. Доставка по всей России.',
      materialId: materials[3].id,
      userId: users[0].id,
      price: 310.00,
      quantity: 50,
      status: 'active',
      location: 'Новосибирск',
      featured: true
    },
    {
      title: 'Речной песок мытый',
      description: 'Качественный речной песок, без примесей. Идеально для строительных работ.',
      materialId: materials[4].id,
      userId: users[1].id,
      price: 750.00,
      quantity: 20,
      status: 'active',
      location: 'Казань'
    }
  ]);

  console.log(`Создано ${advertisements.length} объявлений`);
  return advertisements;
}

async function createInitialTransactions(users) {
  console.log('Создание начальных транзакций...');
  
  const transactions = await db.transaction.bulkCreate([
    {
      senderId: users[3].id, // admin
      receiverId: users[0].id, // test
      amount: 100.00,
      type: 'reward',
      status: 'completed',
      description: 'Начальный бонус от администратора',
      balanceBefore: 0.00,
      balanceAfter: 100.00,
      transactionDate: new Date(),
      completedAt: new Date()
    },
    {
      senderId: users[3].id, // admin
      receiverId: users[1].id, // test1
      amount: 50.00,
      type: 'reward',
      status: 'completed',
      description: 'Начальный бонус от администратора',
      balanceBefore: 0.00,
      balanceAfter: 50.00,
      transactionDate: new Date(),
      completedAt: new Date()
    },
    {
      senderId: users[3].id, // admin
      receiverId: users[2].id, // test2
      amount: 75.00,
      type: 'reward',
      status: 'completed',
      description: 'Начальный бонус от администратора',
      balanceBefore: 0.00,
      balanceAfter: 75.00,
      transactionDate: new Date(),
      completedAt: new Date()
    }
  ]);

  console.log(`Создано ${transactions.length} транзакций`);
  return transactions;
}

module.exports = { seedInitialData };
