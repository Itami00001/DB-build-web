const db = require("../models");
const Transaction = db.transaction;
const User = db.user;
const { Op } = db.Sequelize;

// Create transaction
exports.create = async (req, res) => {
  try {
    const { receiverId, amount, type, description } = req.body;
    const senderId = req.userId;

    // Validate amount
    if (amount <= 0) {
      return res.status(400).send({
        message: "Сумма должна быть положительной"
      });
    }

    // Get sender and receiver
    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);

    if (!sender || !receiver) {
      return res.status(404).send({
        message: "Отправитель или получатель не найден"
      });
    }

    
    // Check sender balance for transfers and purchases
    if (type === 'transfer' && sender.cCoinBalance < amount) {
      return res.status(400).send({
        message: "Недостаточно средств на балансе"
      });
    }

    // Create transaction
    const transaction = await db.sequelize.transaction(async (t) => {
      // Calculate balances first
      const senderBalanceBefore = parseFloat(sender.cCoinBalance || 0);
      const amountFloat = parseFloat(amount);
      const newSenderBalance = senderBalanceBefore - amountFloat;
      
      // Проверка на NaN
      if (isNaN(newSenderBalance)) {
        throw new Error('Invalid balance calculation');
      }
      
      const transactionData = {
        senderId,
        receiverId,
        amount,
        type,
        description,
        balanceBefore: senderBalanceBefore,
        balanceAfter: newSenderBalance,
        status: 'completed',
        completedAt: new Date()
      };
      
      const newTransaction = await Transaction.create(transactionData, { transaction: t });

      // Update balances
      await sender.update({
        cCoinBalance: newSenderBalance
      }, { transaction: t });

      await receiver.update({
        cCoinBalance: parseFloat(receiver.cCoinBalance || 0) + amountFloat
      }, { transaction: t });

      return newTransaction;
    });

    res.status(201).send({
      message: "Транзакция успешно выполнена",
      transaction
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка выполнения транзакции"
    });
  }
};

// Get all transactions for current user
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const type = req.query.type;

    const where = {
      [Op.or]: [
        { senderId: req.userId },
        { receiverId: req.userId }
      ]
    };

    if (type) {
      where.type = type;
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.send({
      transactions: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения транзакций"
    });
  }
};

// Get transaction by ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).send({
        message: "Транзакция не найдена"
      });
    }

    // Check if user is participant or admin
    if (transaction.senderId !== req.userId && 
        transaction.receiverId !== req.userId && 
        req.userRole !== 'admin') {
      return res.status(403).send({
        message: "Доступ запрещен"
      });
    }

    res.send(transaction);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения транзакции"
    });
  }
};

// Admin reward function
exports.rewardUser = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (req.userRole !== 'admin') {
      return res.status(403).send({
        message: "Только администратор может выдавать награды"
      });
    }

    const receiver = await User.findByPk(userId);
    if (!receiver) {
      return res.status(404).send({
        message: "Пользователь не найден"
      });
    }

    const transaction = await db.sequelize.transaction(async (t) => {
      const newTransaction = await Transaction.create({
        senderId: req.userId, // Admin as sender
        receiverId: userId,
        amount,
        type: 'reward',
        description: description || 'Награда от администратора',
        balanceBefore: receiver.cCoinBalance,
        status: 'completed',
        completedAt: new Date(),
        referenceType: 'admin_reward'
      }, { transaction: t });

      await receiver.update({
        cCoinBalance: parseFloat(receiver.cCoinBalance) + parseFloat(amount)
      }, { transaction: t });

      await newTransaction.update({
        balanceAfter: parseFloat(receiver.cCoinBalance) + parseFloat(amount)
      }, { transaction: t });

      return newTransaction;
    });

    res.status(201).send({
      message: "Награда успешно выдана",
      transaction
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка выдачи награды"
    });
  }
};

// Get all transactions (admin only)
exports.findAllAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const type = req.query.type;
    const status = req.query.status;

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.send({
      transactions: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения транзакций"
    });
  }
};
