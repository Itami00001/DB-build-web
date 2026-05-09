module.exports = (sequelize, Sequelize) => {
  const Material = sequelize.define("material", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [2, 200]
      }
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    categoryId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'materialCategories',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    unit: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'шт',
      validate: {
        len: [1, 20]
      }
    },
    inStock: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    minOrder: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 1,
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    image: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    specifications: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {}
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    rating: {
      type: Sequelize.DECIMAL(3, 2),
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    },
    reviewCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    }
  });

  return Material;
};
