module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define("order", {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    advertisementId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'advertisements',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    quantity: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    totalPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    status: {
      type: Sequelize.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'),
      defaultValue: 'pending',
      allowNull: false
    },
    paymentStatus: {
      type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
      allowNull: false
    },
    paymentMethod: {
      type: Sequelize.ENUM('c-coin', 'cash', 'card'),
      allowNull: false
    },
    deliveryAddress: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {}
    },
    trackingNumber: {
      type: Sequelize.STRING,
      allowNull: true
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    orderDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    deliveryDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    cancelledAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    cancellationReason: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  });

  return Order;
};
