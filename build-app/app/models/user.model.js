module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        isGmail(value) {
          if (!value.endsWith('@gmail.com')) {
            throw new Error('Только Gmail адреса разрешены');
          }
        }
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s\-\(\)]+$/
      }
    },
    birthDate: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      validate: {
        isBefore: new Date().toISOString().split('T')[0]
      }
    },
    role: {
      type: Sequelize.ENUM('user', 'admin'),
      defaultValue: 'user',
      allowNull: false
    },
    cCoinBalance: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    lastLogin: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  return User;
};
