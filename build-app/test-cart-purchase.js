const http = require('http');

/**
 * Тестирование покупки товаров из корзины
 */
async function testCartPurchase() {
  try {
    console.log("🧪 Тестирование покупки из корзины...");
    
    // Шаг 1: Вход пользователя
    const loginData = JSON.stringify({
      username: 'test',
      password: 'testtest'
    });
    
    const loginResult = await makeRequest('/api/auth/signin', 'POST', loginData);
    const loginDataParsed = JSON.parse(loginResult);
    const token = loginDataParsed.accessToken;
    
    console.log("✅ Пользователь успешно вошел");
    
    // Шаг 2: Получение объявлений
    const adsResult = await makeRequest('/api/advertisements?limit=3', 'GET');
    const adsData = JSON.parse(adsResult);
    
    if (!adsData.advertisements || adsData.advertisements.length === 0) {
      console.log("❌ Нет объявлений для тестирования");
      return;
    }
    
    console.log(`✅ Получено ${adsData.advertisements.length} объявлений`);
    
    // Шаг 3: Добавление товара в корзину
    const firstAd = adsData.advertisements[0];
    const cartData = JSON.stringify({
      advertisementId: firstAd.id,
      quantity: 2,
      price: firstAd.price
    });
    
    const cartResult = await makeRequest('/api/cart', 'POST', cartData, token);
    console.log("✅ Товар добавлен в корзину");
    
    // Шаг 4: Получение корзины
    const getCartResult = await makeRequest('/api/cart', 'GET', null, token);
    const cartDataParsed = JSON.parse(getCartResult);
    
    console.log(`✅ В корзине ${cartDataParsed.cart?.length || 0} товаров`);
    
    if (cartDataParsed.cart && cartDataParsed.cart.length > 0) {
      console.log("🛒 Товары в корзине:");
      cartDataParsed.cart.forEach(item => {
        console.log(`- ${item.advertisement.title} (${item.advertisement.category?.name || 'Нет категории'}) - ${item.quantity} шт - ${item.totalPrice} C`);
      });
      
      // Шаг 5: Покупка из корзины
      const orderData = JSON.stringify({
        paymentMethod: 'c-coin',
        deliveryAddress: 'Тестовый адрес доставки'
      });
      
      const orderResult = await makeRequest('/api/orders', 'POST', orderData, token);
      const orderDataParsed = JSON.parse(orderResult);
      
      console.log("✅ Заказ успешно создан:");
      console.log(`- ID заказа: ${orderDataParsed.order?.id || 'Не указан'}`);
      console.log(`- Сумма: ${orderDataParsed.order?.totalPrice || 'Не указана'} C`);
      console.log(`- Способ оплаты: ${orderDataParsed.order?.paymentMethod || 'Не указан'}`);
      
    } else {
      console.log("❌ Корзина пуста после добавления товара");
    }
    
    console.log("🎉 Тестирование покупки из корзины завершено!");
    
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

testCartPurchase();
