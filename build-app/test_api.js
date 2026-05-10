const http = require('http');

async function testAPI() {
  try {
    console.log('🧪 Тестирование API транзакций...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/transactions',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📊 Статус ответа:', res.statusCode);
        console.log('📊 Данные:', data);
        console.log('📊 Тип данных:', typeof data);
        
        try {
          const jsonData = JSON.parse(data);
          console.log('📊 Распарсенные данные:', jsonData);
          console.log('📊 Количество транзакций:', jsonData.length);
        } catch (e) {
          console.error('❌ Ошибка парсинга JSON:', e);
        }
        
        process.exit(0);
      });
    });
    
    req.on('error', (e) => {
      console.error('❌ Ошибка запроса:', e);
      process.exit(1);
    });
    
    req.end();
  } catch (error) {
    console.error('❌ Ошибка теста:', error);
    process.exit(1);
  }
}

testAPI();
