const db = require('./app/models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Connected to DB');
    
    // Проверяем существующие таблицы
    const tables = await db.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%material%'
      ORDER BY table_name;
    `);
    
    console.log('Tables found:', tables[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
