/**
 * Индексы для оптимизации запросов к базе данных
 * Этот файл содержит определения индексов для всех таблиц
 */

module.exports = async (db) => {
  try {
    const sequelize = db.sequelize;
    
    // Индексы для пользователей
    await sequelize.getQueryInterface().addIndex('users', ['email'], { unique: true });
    await sequelize.getQueryInterface().addIndex('users', ['username'], { unique: true });
    await sequelize.getQueryInterface().addIndex('users', ['role']);
    await sequelize.getQueryInterface().addIndex('users', ['isActive']);
    await sequelize.getQueryInterface().addIndex('users', ['createdAt']);

    // Индексы для таблицы materialCategories
    await sequelize.getQueryInterface().addIndex('materialCategories', ['name'], { unique: true });
    await sequelize.getQueryInterface().addIndex('materialCategories', ['parentCategoryId']);
    await sequelize.getQueryInterface().addIndex('materialCategories', ['level']);
    await sequelize.getQueryInterface().addIndex('materialCategories', ['isActive']);
    await sequelize.getQueryInterface().addIndex('materialCategories', ['sortOrder']);

    // Индексы для таблицы materials
    await sequelize.getQueryInterface().addIndex('materials', ['name']);
    await sequelize.getQueryInterface().addIndex('materials', ['categoryId']);
    await sequelize.getQueryInterface().addIndex('materials', ['price']);
    await sequelize.getQueryInterface().addIndex('materials', ['inStock']);
    await sequelize.getQueryInterface().addIndex('materials', ['isActive']);
    await sequelize.getQueryInterface().addIndex('materials', ['rating']);
    await sequelize.getQueryInterface().addIndex('materials', ['createdAt']);
    await sequelize.getQueryInterface().addIndex('materials', ['categoryId', 'isActive']); // Составной индекс для фильтрации по категории и активности

    // Индексы для таблицы advertisements
    await sequelize.getQueryInterface().addIndex('advertisements', ['userId']);
    await sequelize.getQueryInterface().addIndex('advertisements', ['materialId']);
    await sequelize.getQueryInterface().addIndex('advertisements', ['status']);
    await sequelize.getQueryInterface().addIndex('advertisements', ['price']);
    await sequelize.getQueryInterface().addIndex('advertisements', ['location']);
    await sequelize.getQueryInterface().addIndex('advertisements', ['createdAt']);
    await sequelize.getQueryInterface().addIndex('advertisements', ['expiresAt']);
    await sequelize.getQueryInterface().addIndex('advertisements', ['featured']);
    await sequelize.getQueryInterface().addIndex('advertisements', ['status', 'featured']); // Составной индекс для активных избранных объявлений
    await sequelize.getQueryInterface().addIndex('advertisements', ['userId', 'status']); // Составной индекс для объявлений пользователя

    // Индексы для таблицы transactions
    await sequelize.getQueryInterface().addIndex('transactions', ['senderId']);
    await sequelize.getQueryInterface().addIndex('transactions', ['receiverId']);
    await sequelize.getQueryInterface().addIndex('transactions', ['type']);
    await sequelize.getQueryInterface().addIndex('transactions', ['status']);
    await sequelize.getQueryInterface().addIndex('transactions', ['transactionDate']);
    await sequelize.getQueryInterface().addIndex('transactions', ['referenceId', 'referenceType']);
    await sequelize.getQueryInterface().addIndex('transactions', ['senderId', 'transactionDate']); // Составной индекс для истории транзакций отправителя
    await sequelize.getQueryInterface().addIndex('transactions', ['receiverId', 'transactionDate']); // Составной индекс для истории транзакций получателя

    // Индексы для таблицы orders
    await sequelize.getQueryInterface().addIndex('orders', ['userId']);
    await sequelize.getQueryInterface().addIndex('orders', ['advertisementId']);
    await sequelize.getQueryInterface().addIndex('orders', ['status']);
    await sequelize.getQueryInterface().addIndex('orders', ['paymentStatus']);
    await sequelize.getQueryInterface().addIndex('orders', ['orderDate']);
    await sequelize.getQueryInterface().addIndex('orders', ['deliveryDate']);
    await sequelize.getQueryInterface().addIndex('orders', ['userId', 'status']); // Составной индекс для заказов пользователя
    await sequelize.getQueryInterface().addIndex('orders', ['status', 'orderDate']); // Составной индекс для фильтрации по статусу и дате

    // Индексы для таблицы orderItems
    await sequelize.getQueryInterface().addIndex('orderItems', ['orderId']);
    await sequelize.getQueryInterface().addIndex('orderItems', ['materialId']);
    await sequelize.getQueryInterface().addIndex('orderItems', ['orderId', 'materialId']); // Составной индекс для элементов заказа

    // Индексы для таблицы cart
    await sequelize.getQueryInterface().addIndex('carts', ['userId']);
    await sequelize.getQueryInterface().addIndex('carts', ['advertisementId']);
    await sequelize.getQueryInterface().addIndex('carts', ['addedAt']);
    await sequelize.getQueryInterface().addIndex('carts', ['isReserved']);
    await sequelize.getQueryInterface().addIndex('carts', ['reservedUntil']);
    await sequelize.getQueryInterface().addIndex('carts', ['userId', 'advertisementId'], { unique: true }); // Уникальный составной индекс

    // Индексы для таблицы reviews
    await sequelize.getQueryInterface().addIndex('reviews', ['userId']);
    await sequelize.getQueryInterface().addIndex('reviews', ['materialId']);
    await sequelize.getQueryInterface().addIndex('reviews', ['advertisementId']);
    await sequelize.getQueryInterface().addIndex('reviews', ['targetUserId']);
    await sequelize.getQueryInterface().addIndex('reviews', ['rating']);
    await sequelize.getQueryInterface().addIndex('reviews', ['reviewDate']);
    await sequelize.getQueryInterface().addIndex('reviews', ['status']);
    await sequelize.getQueryInterface().addIndex('reviews', ['isVerified']);
    await sequelize.getQueryInterface().addIndex('reviews', ['materialId', 'rating']); // Составной индекс для сортировки по рейтингу
    await sequelize.getQueryInterface().addIndex('reviews', ['advertisementId', 'reviewDate']); // Составной индекс для отзывов к объявлению
    await sequelize.getQueryInterface().addIndex('reviews', ['targetUserId', 'rating']); // Составной индекс для отзывов о пользователе
  } catch (error) {
    console.error('Ошибка при создании индексов:', error);
    throw error;
  }
};
