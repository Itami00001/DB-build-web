const { Sequelize } = require('sequelize');
const db = require('../models');
const { Transaction } = db;

/**
 * Сервис для работы с транзакциями C-коинов
 * Реализует атомарные транзакции согласно ACID
 */
class TransactionService {
  /**
   * Перевод C-коинов между пользователями
   * @param {number} senderId - ID отправителя
   * @param {number} receiverId - ID получателя
   * @param {number} amount - сумма перевода
   * @param {string} description - описание транзакции
   * @param {object} options - опции транзакции Sequelize
   * @returns {Promise<Transaction>}
   */
  static async transferCoins(senderId, receiverId, amount, description = '', options = {}) {
    const transaction = options.transaction || await db.sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    try {
      // Проверяем, что отправитель и получатель разные
      if (senderId === receiverId) {
        throw new Error('Нельзя перевести C-коины самому себе');
      }

      // Находим пользователей и блокируем их записи
      const [sender, receiver] = await Promise.all([
        db.user.findByPk(senderId, { 
          transaction,
          lock: transaction.LOCK.UPDATE 
        }),
        db.user.findByPk(receiverId, { 
          transaction,
          lock: transaction.LOCK.UPDATE 
        })
      ]);

      if (!sender || !receiver) {
        throw new Error('Один из пользователей не найден');
      }

      // Проверяем баланс отправителя
      if (parseFloat(sender.cCoinBalance) < amount) {
        throw new Error('Недостаточно C-коинов на балансе отправителя');
      }

      // Сохраняем старые балансы
      const senderBalanceBefore = parseFloat(sender.cCoinBalance);
      const receiverBalanceBefore = parseFloat(receiver.cCoinBalance);

      // Обновляем балансы
      await Promise.all([
        sender.update({
          cCoinBalance: senderBalanceBefore - amount
        }, { transaction }),
        receiver.update({
          cCoinBalance: receiverBalanceBefore + amount
        }, { transaction })
      ]);

      // Создаем запись о транзакции
      const transactionRecord = await Transaction.create({
        senderId,
        receiverId,
        amount,
        type: 'transfer',
        status: 'completed',
        description,
        balanceBefore: senderBalanceBefore,
        balanceAfter: senderBalanceBefore - amount,
        transactionDate: new Date(),
        completedAt: new Date()
      }, { transaction });

      // Если транзакция была создана внутри этой функции, коммитим её
      if (!options.transaction) {
        await transaction.commit();
      }

      return transactionRecord;
    } catch (error) {
      // Если транзакция была создана внутри этой функции, откатываем её
      if (!options.transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Награждение пользователя C-коинами (только для админа)
   * @param {number} adminId - ID администратора
   * @param {number} userId - ID пользователя для награждения
   * @param {number} amount - сумма награждения
   * @param {string} description - описание
   * @param {object} options - опции транзакции Sequelize
   * @returns {Promise<Transaction>}
   */
  static async rewardUser(adminId, userId, amount, description = 'Награда от администратора', options = {}) {
    const transaction = options.transaction || await db.sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    try {
      // Проверяем, что администратор существует и имеет права
      const admin = await db.user.findByPk(adminId, { 
        transaction,
        lock: transaction.LOCK.UPDATE 
      });

      if (!admin || admin.role !== 'admin') {
        throw new Error('Только администратор может награждать пользователей');
      }

      // Находим пользователя и блокируем запись
      const user = await db.user.findByPk(userId, { 
        transaction,
        lock: transaction.LOCK.UPDATE 
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Сохраняем старый баланс
      const userBalanceBefore = parseFloat(user.cCoinBalance);

      // Обновляем баланс пользователя
      await user.update({
        cCoinBalance: userBalanceBefore + amount
      }, { transaction });

      // Создаем запись о транзакции
      const transactionRecord = await Transaction.create({
        senderId: adminId,
        receiverId: userId,
        amount,
        type: 'reward',
        status: 'completed',
        description,
        balanceBefore: userBalanceBefore,
        balanceAfter: userBalanceBefore + amount,
        transactionDate: new Date(),
        completedAt: new Date()
      }, { transaction });

      // Если транзакция была создана внутри этой функции, коммитим её
      if (!options.transaction) {
        await transaction.commit();
      }

      return transactionRecord;
    } catch (error) {
      // Если транзакция была создана внутри этой функции, откатываем её
      if (!options.transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Покупка материала за C-коины
   * @param {number} buyerId - ID покупателя
   * @param {number} sellerId - ID продавца
   * @param {number} amount - сумма покупки
   * @param {number} orderId - ID заказа
   * @param {string} description - описание
   * @param {object} options - опции транзакции Sequelize
   * @returns {Promise<Transaction>}
   */
  static async purchase(buyerId, sellerId, amount, orderId, description = '', options = {}) {
    const transaction = options.transaction || await db.sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    try {
      // Находим пользователей и блокируем их записи
      const [buyer, seller] = await Promise.all([
        db.user.findByPk(buyerId, { 
          transaction,
          lock: transaction.LOCK.UPDATE 
        }),
        db.user.findByPk(sellerId, { 
          transaction,
          lock: transaction.LOCK.UPDATE 
        })
      ]);

      if (!buyer || !seller) {
        throw new Error('Один из пользователей не найден');
      }

      // Проверяем баланс покупателя
      if (parseFloat(buyer.cCoinBalance) < amount) {
        throw new Error('Недостаточно C-коинов для покупки');
      }

      // Сохраняем старые балансы
      const buyerBalanceBefore = parseFloat(buyer.cCoinBalance);
      const sellerBalanceBefore = parseFloat(seller.cCoinBalance);

      // Обновляем балансы
      await Promise.all([
        buyer.update({
          cCoinBalance: buyerBalanceBefore - amount
        }, { transaction }),
        seller.update({
          cCoinBalance: sellerBalanceBefore + amount
        }, { transaction })
      ]);

      // Создаем запись о транзакции
      const transactionRecord = await Transaction.create({
        senderId: buyerId,
        receiverId: sellerId,
        amount,
        type: 'purchase',
        status: 'completed',
        description: description || `Покупка заказа #${orderId}`,
        referenceId: orderId,
        referenceType: 'order',
        balanceBefore: buyerBalanceBefore,
        balanceAfter: buyerBalanceBefore - amount,
        transactionDate: new Date(),
        completedAt: new Date()
      }, { transaction });

      // Если транзакция была создана внутри этой функции, коммитим её
      if (!options.transaction) {
        await transaction.commit();
      }

      return transactionRecord;
    } catch (error) {
      // Если транзакция была создана внутри этой функции, откатываем её
      if (!options.transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Получение истории транзакций пользователя
   * @param {number} userId - ID пользователя
   * @param {object} options - опции запроса
   * @returns {Promise<Array>}
   */
  static async getTransactionHistory(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      startDate,
      endDate
    } = options;

    const whereClause = {
      [Sequelize.Op.or]: [
        { senderId: userId },
        { receiverId: userId }
      ]
    };

    // Добавляем фильтры
    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.transactionDate = {};
      if (startDate) {
        whereClause.transactionDate[Sequelize.Op.gte] = startDate;
      }
      if (endDate) {
        whereClause.transactionDate[Sequelize.Op.lte] = endDate;
      }
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.user,
          as: 'sender',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: db.user,
          as: 'receiver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['transactionDate', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return {
      transactions: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Получение баланса пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<number>}
   */
  static async getUserBalance(userId) {
    const user = await db.user.findByPk(userId, {
      attributes: ['cCoinBalance']
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    return parseFloat(user.cCoinBalance);
  }
}

module.exports = TransactionService;
