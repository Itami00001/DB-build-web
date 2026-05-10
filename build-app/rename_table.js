const db = require('./app/models');
const sequelize = db.sequelize;

sequelize.query('ALTER TABLE "order" RENAME TO orders')
  .then(() => {
    console.log('Таблица order успешно переименована в orders');
    process.exit(0);
  })
  .catch(err => {
    console.error('Ошибка переименования:', err);
    process.exit(1);
  });
