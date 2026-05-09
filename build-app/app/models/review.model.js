module.exports = (sequelize, Sequelize) => {
  const Review = sequelize.define("review", {
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
    materialId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'materials',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    advertisementId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'advertisements',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    targetUserId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    title: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        len: [3, 200]
      }
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        len: [10, 2000]
      }
    },
    pros: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    },
    cons: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    helpfulCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    reviewDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    response: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    responseDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'hidden'),
      defaultValue: 'pending',
      allowNull: false
    }
  });

  return Review;
};
