module.exports = (sequelize, Sequelize) => {
  const Cart = sequelize.define("cart", {
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
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    totalPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    addedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    lastModified: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    isReserved: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    reservedUntil: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  return Cart;
};
