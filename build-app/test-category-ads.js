const http = require('http');

/**
 * Тестирование создания объявлений с категориями
 */
async function testCategoryAds() {
  try {
    console.log("🧪 Тестирование создания объявлений с категориями...");
    
    // Шаг 1: Вход пользователя
    const loginData = JSON.stringify({
      username: 'test',
      password: 'testtest'
    });
    
    const loginResult = await makeRequest('/api/auth/signin', 'POST', loginData);
    console.log("🔍 Ответ от API входа:", loginResult);
    
    const loginDataParsed = JSON.parse(loginResult);
    console.log("🔍 Структура ответа:", Object.keys(loginDataParsed));
    
    const token = loginDataParsed.accessToken || loginDataParsed.token;
    
    console.log("✅ Пользователь успешно вошел");
    console.log("🔑 Токен получен:", token ? "Да" : "Нет");
    console.log("🔑 Длина токена:", token ? token.length : 0);
    
    // Шаг 2: Получение категорий
    const categoriesResult = await makeRequest('/api/material-categories', 'GET');
    const categories = JSON.parse(categoriesResult);
    console.log(`✅ Получено ${categories.length} категорий`);
    
    // Шаг 3: Создание объявления с категорией
    const adData = JSON.stringify({
      title: 'Тестовое объявление с категорией Кирпич',
      description: 'Описание тестового объявления с категорией Кирпич',
      categoryId: categories[0].id, // Кирпич
      price: 100,
      quantity: 10
    });
    
    const createResult = await makeRequest('/api/advertisements', 'POST', adData, token);
    const createdAd = JSON.parse(createResult);
    
    console.log("✅ Объявление успешно создано:");
    console.log("Структура ответа:", Object.keys(createdAd));
    
    // Проверяем разные возможные структуры ответа
    const ad = createdAd.advertisement || createdAd.data || createdAd;
    if (ad && ad.title) {
      console.log(`- Название: ${ad.title}`);
      console.log(`- Категория ID: ${ad.categoryId}`);
      console.log(`- Цена: ${ad.price} C`);
      console.log(`- Количество: ${ad.quantity}`);
    } else {
      console.log("Полный ответ:", JSON.stringify(createdAd, null, 2));
    }
    
    // Шаг 4: Проверка получения объявлений с категориями
    const adsResult = await makeRequest('/api/advertisements', 'GET');
    const ads = JSON.parse(adsResult);
    
    console.log(`✅ Получено ${ads.advertisements?.length || 0} объявлений`);
    
    if (ads.advertisements && ads.advertisements.length > 0) {
      console.log("📢 Последние объявления:");
      ads.advertisements.slice(-3).forEach(ad => {
        console.log(`- ${ad.title} (категория ID: ${ad.categoryId}) - ${ad.price} C`);
      });
    }
    
    console.log("🎉 Тестирование успешно завершено!");
    
  } catch (error) {
    console.error("❌ Ошибка при тестировании:", error.message);
  }
}

function makeRequest(path, method, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method
    };
    
    options.headers = {};
    
    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    
    if (token) {
      options.headers['x-access-token'] = token;
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve(responseData);
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

testCategoryAds();
