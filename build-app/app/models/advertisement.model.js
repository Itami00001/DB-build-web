module.exports = (sequelize, Sequelize) => {
  const Advertisement = sequelize.define("advertisement", {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [5, 200]
      }
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    categoryId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    quantity: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    status: {
      type: Sequelize.ENUM('active', 'sold', 'inactive', 'reserved'),
      defaultValue: 'active',
      allowNull: false
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true
    },
    images: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    },
    contactInfo: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {}
    },
    views: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    featured: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  });

  return Advertisement;
};
