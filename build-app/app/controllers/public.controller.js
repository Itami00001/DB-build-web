const db = require("../models");

// Получить публичную статистику платформы
exports.getPublicStats = async (req, res) => {
  try {
    // Получаем количество пользователей
    const userCount = await db.user.count();
    
    // Получаем количество материалов
    const materialCount = await db.material.count();
    
    // Получаем количество объявлений
    const advertisementCount = await db.advertisement.count();
    
    // Получаем количество категорий материалов
    const categoryCount = await db.materialCategories.count();
    
    // Получаем количество активных объявлений (если поле isActive существует)
    let activeAdvertisementsCount = advertisementCount;
    try {
      activeAdvertisementsCount = await db.advertisement.count({
        where: { isActive: true }
      });
    } catch (error) {
      // Если поля isActive нет, используем общее количество
      activeAdvertisementsCount = advertisementCount;
    }

    // Получаем количество транзакций
    let transactionCount = 0;
    try {
      transactionCount = await db.transaction.count();
    } catch (error) {
      console.error("Ошибка получения количества транзакций:", error);
      transactionCount = 0;
    }

    const stats = {
      totalUsers: userCount,
      totalMaterials: materialCount,
      totalAdvertisements: advertisementCount,
      totalTransactions: transactionCount,
      activeAdvertisements: activeAdvertisementsCount,
      totalCategories: categoryCount
    };

    res.send(stats);
  } catch (error) {
    console.error("Ошибка получения публичной статистики:", error);
    res.status(500).send({
      message: "Ошибка получения статистики"
    });
  }
};
