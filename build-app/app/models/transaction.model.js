module.exports = (sequelize, Sequelize) => {
  const Transaction = sequelize.define("transaction", {
    senderId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    type: {
      type: Sequelize.ENUM('transfer', 'purchase', 'reward', 'refund'),
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    referenceId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID связанной сущности (заказа, объявления и т.д.)'
    },
    referenceType: {
      type: Sequelize.ENUM('order', 'advertisement', 'admin_reward'),
      allowNull: true
    },
    transactionDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    completedAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    failedAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    failureReason: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    balanceBefore: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    balanceAfter: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    }
  });

  return Transaction;
};
