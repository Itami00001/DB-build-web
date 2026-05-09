const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'build_project',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: true, // Использовать snake_case вместо camelCase
      freezeTableName: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      paranoid: true // Мягкое удаление
    }
  }
);

module.exports = sequelize;
