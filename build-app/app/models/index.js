const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  define: dbConfig.define,
  logging: dbConfig.logging
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require("./user.model")(sequelize, Sequelize);
db.materialCategories = require("./materialCategory.model")(sequelize, Sequelize);
db.material = require("./material.model")(sequelize, Sequelize);
db.advertisement = require("./advertisement.model")(sequelize, Sequelize);
db.order = require("./order.model")(sequelize, Sequelize);
db.transaction = require("./transaction.model")(sequelize, Sequelize);
db.cart = require("./cart.model")(sequelize, Sequelize);
db.review = require("./review.model")(sequelize, Sequelize);

// Setup associations
require("./associations")(db);

module.exports = db;
