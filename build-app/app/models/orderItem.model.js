module.exports = (sequelize, Sequelize) => {
  const OrderItem = sequelize.define("orderItem", {
    orderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    materialId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'materials',
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
    }
  });

  return OrderItem;
};
