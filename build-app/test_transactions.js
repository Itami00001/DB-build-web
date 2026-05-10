const db = require('./app/models');

async function testTransactions() {
  try {
    console.log('🧪 Тестирование API транзакций...');
    
    const transactions = await db.transaction.findAll({
      include: [
        {
          model: db.user,
          as: 'sender',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: db.user,
          as: 'receiver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['transactionDate', 'DESC']]
    });
    
    console.log('✅ Транзакции найдены:', transactions.length);
    if (transactions.length > 0) {
      console.log('✅ Первая транзакция:', JSON.stringify(transactions[0], null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

testTransactions();
