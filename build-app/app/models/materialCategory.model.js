module.exports = (sequelize, Sequelize) => {
  const MaterialCategory = sequelize.define("materialCategories", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 100]
      }
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    parentCategoryId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'materialCategories',
        key: 'id',
        as: 'parentCategory'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    level: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    sortOrder: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    }
  });

  return MaterialCategory;
};
