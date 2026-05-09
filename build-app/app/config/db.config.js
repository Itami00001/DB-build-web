module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "build_user",
  PASSWORD: process.env.DB_PASSWORD || "build_password_123",
  DB: process.env.DB_NAME || "build_project_db",
  port: process.env.DB_PORT || 5432,
  dialect: "postgres",
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    underscored: true,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci'
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false
};
