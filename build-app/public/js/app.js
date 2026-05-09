// Глобальные переменные
let currentUser = null;
let authToken = null;

// Конфигурация API
const API_BASE_URL = 'http://localhost:3000/api';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Очищаем возможные поврежденные данные
    clearCorruptedLocalStorage();
    
    // Проверяем наличие токена при загрузке страницы
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        try {
            authToken = token;
            currentUser = JSON.parse(user);
            
            // Проверяем валидность пользователя
            if (currentUser && currentUser.username) {
                updateUIForLoggedInUser();
                // Асинхронно проверяем токен на сервере
                validateTokenAndLoadData();
            } else {
                clearAuthData();
                showPage('home');
                loadFeaturedMaterials();
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных пользователя:', error);
            clearAuthData();
            showPage('home');
            loadFeaturedMaterials();
        }
    } else {
        showPage('home');
        loadFeaturedMaterials();
    }

    // Назначаем обработчики событий
    setupEventListeners();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Форма входа
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Форма регистрации
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Форма создания объявления
    const createAdForm = document.getElementById('createAdvertisementForm');
    if (createAdForm) {
        createAdForm.addEventListener('submit', handleCreateAdvertisement);
    }
    
    // Форма создания транзакции
    const createTransactionForm = document.getElementById('createTransactionForm');
    if (createTransactionForm) {
        createTransactionForm.addEventListener('submit', handleCreateTransaction);
    }
    
    // Обработчик для изменения единиц измерения
    const materialUnit = document.getElementById('materialUnit');
    if (materialUnit) {
        materialUnit.addEventListener('change', updateUnits);
    }
    
    // Обработчики для навигационных ссылок
    document.querySelectorAll('[data-page]').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Обработчик для выхода
    document.querySelectorAll('[data-action="logout"]').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
}

// Показать страницу
function showPage(pageName) {
    // Скрыть все страницы
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.style.display = 'none');
    
    // Показать выбранную страницу
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.style.display = 'block';
        
        // Загрузить данные для страницы
        switch(pageName) {
            case 'home':
                loadHomePage();
                break;
            case 'advertisements':
                loadAdvertisements();
                break;
            case 'cart':
                loadCart();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'transactions':
                loadTransactions();
                break;
            case 'profile':
                loadProfile();
                break;
            case 'createAdvertisement':
                loadCreateAdvertisementForm();
                break;
            case 'adminDatabase':
                loadAdminDatabase();
                break;
            case 'adminLogs':
                loadAdminLogs();
                break;
        }
    }
}

// Обработчик входа
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.accessToken;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUIForLoggedInUser();
            showPage('home');
            showMessage('success', 'Вход выполнен успешно!');
        } else {
            showMessage('error', data.message || 'Ошибка входа');
        }
    } catch (error) {
        showMessage('error', 'Ошибка соединения с сервером');
    } finally {
        hideLoading();
    }
}

// Обработчик регистрации
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('regFirstName').value,
        lastName: document.getElementById('regLastName').value,
        username: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        passwordConfirm: document.getElementById('regPasswordConfirm').value,
        birthDate: document.getElementById('regBirthDate').value,
        phone: document.getElementById('regPhone').value
    };
    
    // Валидация
    if (formData.password !== formData.passwordConfirm) {
        showMessage('error', 'Пароли не совпадают');
        return;
    }
    
    if (!formData.email.endsWith('@gmail.com')) {
        showMessage('error', 'Только Gmail адреса разрешены');
        return;
    }
    
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('success', 'Регистрация успешна! Теперь вы можете войти.');
            showPage('login');
        } else {
            showMessage('error', data.message || 'Ошибка регистрации');
        }
    } catch (error) {
        showMessage('error', 'Ошибка соединения с сервером');
    } finally {
        hideLoading();
    }
}

// Выход из системы
function logout() {
    clearAuthData();
    showPage('home');
    showMessage('success', 'Вы вышли из системы');
}

// Обновить UI для вошедшего пользователя
function updateUIForLoggedInUser() {
    if (!currentUser) return;
    
    // Скрыть элементы для неавторизованных пользователей
    const authNav = document.getElementById('authNav');
    const registerNav = document.getElementById('registerNav');
    if (authNav) authNav.style.display = 'none';
    if (registerNav) registerNav.style.display = 'none';
    
    // Показать элементы для авторизованных пользователей
    const userNav = document.getElementById('userNav');
    const cCoinNav = document.getElementById('cCoinNav');
    const createAdNav = document.getElementById('createAdNav');
    if (userNav) userNav.style.display = 'block';
    if (cCoinNav) cCoinNav.style.display = 'block';
    if (createAdNav) createAdNav.style.display = 'block';
    
    // Показать админ панель для администратора
    if (currentUser.role === 'admin') {
        const adminNav = document.getElementById('adminNav');
        if (adminNav) adminNav.style.display = 'block';
    }
    
    // Обновить имя пользователя и баланс
    const usernameElement = document.getElementById('username');
    const cCoinBalanceElement = document.getElementById('cCoinBalance');
    if (usernameElement) usernameElement.textContent = currentUser.username;
    if (cCoinBalanceElement) cCoinBalanceElement.textContent = `${currentUser.cCoinBalance || 0} C`;
}

// Обновить UI для вышедшего пользователя
function updateUIForLoggedOutUser() {
    // Показать элементы для неавторизованных пользователей
    document.getElementById('authNav').style.display = 'block';
    document.getElementById('registerNav').style.display = 'block';
    
    // Скрыть элементы для авторизованных пользователей
    document.getElementById('userNav').style.display = 'none';
    document.getElementById('cCoinNav').style.display = 'none';
    document.getElementById('createAdNav').style.display = 'none';
    document.getElementById('adminNav').style.display = 'none';
}

// Очистить поврежденные данные localStorage
function clearCorruptedLocalStorage() {
    try {
        // Проверяем валидность данных в localStorage
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        
        if (user) {
            try {
                JSON.parse(user);
            } catch (e) {
                console.warn('Поврежденные данные пользователя в localStorage, очищаем...');
                localStorage.removeItem('currentUser');
            }
        }
        
        if (!token || token.length < 10) {
            console.warn('Невалидный токен в localStorage, очищаем...');
            localStorage.removeItem('authToken');
        }
    } catch (error) {
        console.error('Ошибка при очистке localStorage:', error);
    }
}

// Валидировать токен и загрузить данные
async function validateTokenAndLoadData() {
    try {
        const response = await apiRequest('/users/profile', 'GET');
        if (response) {
            // Проверяем, что данные соответствуют текущему пользователю
            if (response.username === currentUser.username) {
                currentUser = response;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateUIForLoggedInUser();
            } else {
                console.warn('Несоответствие данных пользователя, перезагружаем...');
                clearAuthData();
                showPage('home');
                loadFeaturedMaterials();
            }
        }
    } catch (error) {
        console.error('Ошибка валидации токена:', error);
        // Если токен невалидный, очищаем localStorage и перенаправляем на вход
        if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
            clearAuthData();
            showPage('home');
            loadFeaturedMaterials();
            showMessage('warning', 'Сессия истекла. Пожалуйста, войдите снова.');
        }
    }
}

// Очистить данные аутентификации
function clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    updateUIForLoggedOutUser();
}

// Загрузить данные пользователя
async function loadUserData() {
    try {
        const response = await apiRequest('/users/profile', 'GET');
        if (response) {
            currentUser = response;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForLoggedInUser();
        }
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        // Если токен невалидный, очищаем localStorage и перенаправляем на вход
        if (error.message && error.message.includes('401')) {
            logout();
        }
    }
}

// Загрузить главную страницу
async function loadHomePage() {
    try {
        // Загружаем публичную статистику платформы для всех пользователей
        try {
            const stats = await apiRequest('/public/stats', 'GET');
            if (stats) {
                document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
                document.getElementById('totalMaterials').textContent = stats.totalMaterials || 0;
                document.getElementById('totalAds').textContent = stats.totalAdvertisements || 0;
                document.getElementById('totalTransactions').textContent = stats.totalTransactions || 0;
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            // Устанавливаем значения по умолчанию
            setDefaultStats();
        }
        
        // Загружаем избранные материалы для всех
        await loadFeaturedMaterials();
    } catch (error) {
        console.error('Ошибка загрузки главной страницы:', error);
        setDefaultStats();
    }
}

// Установить статистику по умолчанию
function setDefaultStats() {
    document.getElementById('totalUsers').textContent = '0';
    document.getElementById('totalMaterials').textContent = '0';
    document.getElementById('totalAds').textContent = '0';
    document.getElementById('totalTransactions').textContent = '0';
}

// Загрузить избранные материалы
async function loadFeaturedMaterials() {
    try {
        const container = document.getElementById('featuredMaterials');
        if (!container) {
            console.warn('Контейнер featuredMaterials не найден на главной странице');
            return;
        }
        
        const materials = await apiRequest('/materials/featured', 'GET');
        if (materials && materials.length > 0) {
            container.innerHTML = '';
            
            materials.forEach(material => {
                const card = createMaterialCard(material);
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<div class="col-12"><p class="text-muted text-center">Избранные материалы暂时 отсутствуют</p></div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки избранных материалов:', error);
        const container = document.getElementById('featuredMaterials');
        if (container) {
            container.innerHTML = '<div class="col-12"><p class="text-muted text-center">Ошибка загрузки материалов</p></div>';
        }
    }
}

// Создать карточку материала
function createMaterialCard(material) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
    col.innerHTML = `
        <div class="card h-100">
            ${material.image ? `<img src="${material.image}" class="card-img-top" alt="${material.name}" style="height: 200px; object-fit: cover;">` : ''}
            <div class="card-body">
                <h5 class="card-title">${material.name}</h5>
                <p class="card-text">${material.description || ''}</p>
                <p class="card-text">
                    <small class="text-muted">Категория: ${material.category ? material.category.name : 'Не указана'}</small>
                </p>
                <p class="card-text">
                    <strong>Цена: ${material.price} ${material.unit}</strong>
                </p>
                <p class="card-text">
                    <small>На складе: ${material.inStock} ${material.unit}</small>
                </p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="text-warning">
                        ${generateStarRating(material.rating)}
                        <small>(${material.reviewCount})</small>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="viewMaterial(${material.id})">
                        <i class="fas fa-eye"></i> Подробнее
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Создать карточку объявления
function createAdvertisementCard(advertisement) {
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-4';
    
    col.innerHTML = `
        <div class="card h-100">
            <div class="card-body">
                <h5 class="card-title">${advertisement.title}</h5>
                <p class="card-text">${advertisement.description || ''}</p>
                <p class="card-text">
                    <strong>Материал: ${advertisement.material ? advertisement.material.name : 'Не указан'}</strong>
                </p>
                <p class="card-text">
                    <strong>Цена: ${advertisement.price} C</strong>
                </p>
                <p class="card-text">
                    <small>Количество: ${advertisement.quantity}</small>
                </p>
                <p class="card-text">
                    <small>Продавец: ${advertisement.user ? advertisement.user.username : 'Не указан'}</small>
                </p>
                <div class="d-flex justify-content-between">
                    <span class="badge ${advertisement.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                        ${getStatusText(advertisement.status)}
                    </span>
                    <button class="btn btn-primary btn-sm" onclick="viewAdvertisement(${advertisement.id})">
                        <i class="fas fa-eye"></i> Подробнее
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Генерировать звездный рейтинг
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let html = '';
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star text-warning"></i>';
    }
    if (halfStar) {
        html += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star text-warning"></i>';
    }
    
    return html;
}

// Получить текст статуса
function getStatusText(status) {
    const statusMap = {
        'active': 'Активно',
        'sold': 'Продано',
        'inactive': 'Неактивно',
        'reserved': 'Забронировано'
    };
    return statusMap[status] || status;
}

// API запрос
async function apiRequest(endpoint, method = 'GET', body = null, retryCount = 0) {
    const maxRetries = 2;
    
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (authToken) {
            options.headers['x-access-token'] = authToken;
        }
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        // Добавляем timeout для избежания зависаний
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        options.signal = controller.signal;
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        clearTimeout(timeoutId);
        
        if (response.status === 401) {
            // Токен истек, выходим из системы только если это не проверка при загрузке
            if (!endpoint.includes('/users/profile')) {
                clearAuthData();
                showPage('home');
                showMessage('warning', 'Сессия истекла. Пожалуйста, войдите снова.');
            }
            throw new Error('401 - Токен истек');
        }
        
        if (response.status === 403) {
            throw new Error('403 - Доступ запрещен');
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `HTTP ${response.status}`;
            throw new Error(errorMessage);
        }
        
        return await response.json();
        
    } catch (error) {
        // Если это ошибка сети и еще есть попытки
        if ((error.name === 'TypeError' || error.name === 'AbortError') && retryCount < maxRetries) {
            console.warn(`Повторная попытка запроса ${retryCount + 1}/${maxRetries}:`, endpoint);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return apiRequest(endpoint, method, body, retryCount + 1);
        }
        
        // Если это ошибка аутентификации, не выбрасываем исключение дальше
        if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
            throw error;
        }
        
        // Для других ошибок выводим в консоль и выбрасываем исключение
        console.error(`API Request Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}

// Показать сообщение
function showMessage(type, message) {
    const toastContainer = document.querySelector('.toast-container');
    const toastId = 'toast-' + Date.now();
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Удалить toast после скрытия
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Показать/скрыть загрузку
function showLoading() {
    document.querySelector('.loading-spinner').style.display = 'block';
}

function hideLoading() {
    document.querySelector('.loading-spinner').style.display = 'none';
}

// Просмотр материала
function viewMaterial(materialId) {
    // Здесь можно добавить переход на страницу детальной информации о материале
    showMessage('info', 'Просмотр материала #' + materialId);
}

// Просмотр объявления
function viewAdvertisement(advertisementId) {
    // Здесь можно добавить переход на страницу детальной информации об объявлении
    showMessage('info', 'Просмотр объявления #' + advertisementId);
}

// Загрузить объявления
async function loadAdvertisements() {
    try {
        const data = await apiRequest('/advertisements/all', 'GET');
        const container = document.getElementById('advertisementsList');
        const noAds = document.getElementById('noAdvertisements');
        
        container.innerHTML = '';
        
        // API возвращает массив объявлений напрямую
        if (data && Array.isArray(data) && data.length > 0) {
            noAds.style.display = 'none';
            data.forEach(advertisement => {
                const card = createAdvertisementCard(advertisement);
                container.appendChild(card);
            });
        } else {
            noAds.style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка загрузки объявлений:', error);
        document.getElementById('noAdvertisements').style.display = 'block';
    }
}

// Фильтровать объявления
function filterAdvertisements() {
    const category = document.getElementById('filterCategory').value;
    const minPrice = document.getElementById('filterPriceMin').value;
    const maxPrice = document.getElementById('filterPriceMax').value;
    const searchTerm = document.getElementById('searchAds').value.toLowerCase();
    
    // Здесь будет логика фильтрации
    loadAdvertisements();
}

// Загрузить корзину
async function loadCart() {
    try {
        const data = await apiRequest('/cart', 'GET');
        const container = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        
        container.innerHTML = '';
        
        if (data && data.cartItems && data.cartItems.length > 0) {
            emptyCart.style.display = 'none';
            let total = 0;
            let itemsCount = 0;
            
            data.cartItems.forEach(item => {
                const cartItem = createCartItem(item);
                container.appendChild(cartItem);
                total += item.price * item.quantity;
                itemsCount += item.quantity;
            });
            
            // Обновляем итоговую информацию
            document.getElementById('cartItemsCount').textContent = itemsCount;
            document.getElementById('cartTotal').textContent = total.toFixed(2) + ' C';
            document.getElementById('cartGrandTotal').textContent = total.toFixed(2) + ' C';
        } else {
            emptyCart.style.display = 'block';
            document.getElementById('cartItemsCount').textContent = '0';
            document.getElementById('cartTotal').textContent = '0 C';
            document.getElementById('cartGrandTotal').textContent = '0 C';
        }
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
        document.getElementById('emptyCart').style.display = 'block';
    }
}
async function loadOrders() {
    try {
        const data = await apiRequest('/orders', 'GET');
        const container = document.getElementById('ordersList');
        const noOrders = document.getElementById('noOrders');
        
        container.innerHTML = '';
        
        if (data && data.orders && data.orders.length > 0) {
            noOrders.style.display = 'none';
            data.orders.forEach(order => {
                const orderCard = createOrderCard(order);
                container.appendChild(orderCard);
            });
        } else {
            noOrders.style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        document.getElementById('noOrders').style.display = 'block';
    }
}

// Создать карточку заказа
function createOrderCard(order) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    const statusClass = getStatusClass(order.status);
    const statusText = getStatusText(order.status);
    
    col.innerHTML = `
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Заказ #${order.id}</h6>
                <span class="badge ${statusClass}">${statusText}</span>
            </div>
            <div class="card-body">
                <p class="mb-1"><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p class="mb-1"><strong>Сумма:</strong> ${order.totalPrice} C</p>
                <p class="mb-1"><strong>Товаров:</strong> ${order.orderItems?.length || 0}</p>
                <div class="mt-2">
                    <small class="text-muted">
                        ${order.orderItems?.slice(0, 2).map(item => item.name || item.material?.name).join(', ') || 'Товары'}
                        ${order.orderItems?.length > 2 ? '...' : ''}
                    </small>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails(${order.id})">
                    <i class="fas fa-eye"></i> Детали
                </button>
            </div>
        </div>
    `;
    
    return col;
}

// Фильтровать заказы
function filterOrders() {
    const status = document.getElementById('filterOrderStatus').value;
    const period = document.getElementById('filterOrderPeriod').value;
    
    // Здесь будет логика фильтрации
    loadOrders();
}

// Просмотр деталей заказа
function viewOrderDetails(orderId) {
    showMessage('info', 'Детали заказа #' + orderId);
}

// Добавить товар в корзину
async function addToCart(advertisementId) {
    try {
        showLoading();
        const response = await apiRequest('/cart', 'POST', { advertisementId });
        if (response) {
            showMessage('success', 'Товар добавлен в корзину!');
            loadCart();
        }
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        showMessage('error', 'Ошибка добавления в корзину');
    } finally {
        hideLoading();
    }
}

// Удалить товар из корзины
async function removeFromCart(cartItemId) {
    try {
        showLoading();
        await apiRequest(`/cart/${cartItemId}`, 'DELETE');
        showMessage('success', 'Товар удален из корзины');
        loadCart();
        loadUserData(); // Обновить баланс
    } catch (error) {
        console.error('Ошибка удаления из корзины:', error);
        showMessage('error', 'Ошибка удаления из корзины');
    } finally {
        hideLoading();
    }
}

// Очистить форму объявления
function resetAdForm() {
    document.getElementById('createAdvertisementForm').reset();
}

// Обновить единицы измерения в форме объявления
function updateUnits() {
    const unit = document.getElementById('materialUnit').value;
    document.getElementById('quantityUnit').textContent = unit;
    document.getElementById('minOrderUnit').textContent = unit;
    document.getElementById('stockUnit').textContent = unit;
}

// Загрузить профиль
async function loadProfile() {
    try {
        const user = await apiRequest('/users/profile', 'GET');
        if (user) {
            const container = document.getElementById('profileInfo');
            container.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5>Личная информация</h5>
                            </div>
                            <div class="card-body">
                                <p><strong>Имя:</strong> ${user.firstName} ${user.lastName}</p>
                                <p><strong>Имя пользователя:</strong> ${user.username}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                                <p><strong>Телефон:</strong> ${user.phone || 'Не указан'}</p>
                                <p><strong>Дата рождения:</strong> ${new Date(user.birthDate).toLocaleDateString()}</p>
                                <p><strong>Роль:</strong> ${user.role}</p>
                                <p><strong>Баланс C-coin:</strong> ${user.cCoinBalance} C</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5>Статистика</h5>
                            </div>
                            <div class="card-body">
                                <p><strong>Объявлений:</strong> ${user.advertisements ? user.advertisements.length : 0}</p>
                                <p><strong>Заказов:</strong> ${user.orders ? user.orders.length : 0}</p>
                                <p><strong>Дата регистрации:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                                <p><strong>Последний вход:</strong> ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Не было'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        showMessage('error', 'Ошибка загрузки профиля');
    }
}

// Загрузить форму создания объявления
async function loadCreateAdvertisementForm() {
    try {
        const materials = await apiRequest('/materials', 'GET');
        if (materials) {
            const container = document.getElementById('createAdForm');
            container.innerHTML = `
                <div class="row">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">
                                <h5>Создать объявление</h5>
                            </div>
                            <div class="card-body">
                                <form id="createAdFormElement">
                                    <div class="mb-3">
                                        <label class="form-label">Заголовок *</label>
                                        <input type="text" class="form-control" id="adTitle" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Описание</label>
                                        <textarea class="form-control" id="adDescription" rows="3"></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Материал *</label>
                                        <select class="form-control" id="adMaterial" required>
                                            <option value="">Выберите материал</option>
                                            ${materials.materials.map(material => 
                                                `<option value="${material.id}">${material.name}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Цена (C-coin) *</label>
                                            <input type="number" class="form-control" id="adPrice" step="0.01" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Количество *</label>
                                            <input type="number" class="form-control" id="adQuantity" step="0.01" required>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Местоположение</label>
                                        <input type="text" class="form-control" id="adLocation">
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-plus-circle"></i> Создать объявление
                                    </button>
                                    <small class="text-muted d-block mt-2">
                                        <i class="fas fa-info-circle"></i> Создание объявления стоит 10 C-coin
                                    </small>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h6>Ваш баланс</h6>
                            </div>
                            <div class="card-body text-center">
                                <h3 class="text-primary">${currentUser.cCoinBalance} C</h3>
                                <p class="text-muted">После создания объявления: ${currentUser.cCoinBalance - 10} C</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Назначаем обработчик для формы
            document.getElementById('createAdFormElement').addEventListener('submit', handleCreateAdvertisement);
        }
    } catch (error) {
        console.error('Ошибка загрузки формы создания объявления:', error);
        showMessage('error', 'Ошибка загрузки формы');
    }
}

// Обработчик создания объявления
async function handleCreateAdvertisement(event) {
    event.preventDefault();
    
    try {
        showLoading();
        
        const formData = {
            name: document.getElementById('materialName').value,
            description: document.getElementById('materialDescription').value,
            price: parseFloat(document.getElementById('materialPrice').value),
            quantity: parseFloat(document.getElementById('materialQuantity').value),
            unit: document.getElementById('materialUnit').value,
            minOrder: parseFloat(document.getElementById('materialMinOrder').value) || 1,
            inStock: parseFloat(document.getElementById('materialInStock').value) || 100,
            categoryId: parseInt(document.getElementById('materialCategory').value)
        };
        
        const response = await apiRequest('/advertisements', 'POST', formData);
        
        if (response) {
            showMessage('success', 'Объявление успешно создано!');
            showPage('advertisements');
            loadUserData(); // Обновить баланс
        }
    } catch (error) {
        console.error('Ошибка создания объявления:', error);
        showMessage('error', 'Ошибка создания объявления');
    } finally {
        hideLoading();
    }
}

// Загрузить транзакции
async function loadTransactions() {
    try {
        const data = await apiRequest('/transactions', 'GET');
        const container = document.getElementById('transactionsList');
        const noTransactions = document.getElementById('noTransactions');
        
        container.innerHTML = '';
        
        if (data && Array.isArray(data) && data.length > 0) {
            noTransactions.style.display = 'none';
            data.forEach(transaction => {
                const card = createTransactionCard(transaction);
                container.appendChild(card);
            });
        } else {
            noTransactions.style.display = 'block';
        }
        
        // Загружаем список пользователей для формы создания транзакции
        await loadUsersForTransaction();
    } catch (error) {
        console.error('Ошибка загрузки транзакций:', error);
        document.getElementById('noTransactions').style.display = 'block';
    }
}

// Загрузить пользователей для формы транзакции
async function loadUsersForTransaction() {
    try {
        const users = await apiRequest('/users', 'GET');
        const select = document.getElementById('transactionRecipient');
        const modalBalance = document.getElementById('modalUserBalance');
        
        if (select && users && Array.isArray(users)) {
            select.innerHTML = '<option value="">Выберите получателя</option>';
            
            users.forEach(user => {
                // Не показываем текущего пользователя в списке получателей
                if (currentUser && user.id !== currentUser.id) {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${user.username} (баланс: ${user.cCoinBalance || 0} C)`;
                    select.appendChild(option);
                }
            });
        }
        
        // Обновляем баланс текущего пользователя в модальном окне
        if (modalBalance && currentUser) {
            modalBalance.textContent = currentUser.cCoinBalance || 0;
        }
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
    }
}

// Создать карточку транзакции
function createTransactionCard(transaction) {
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-4';
    
    const statusClass = getTransactionStatusClass(transaction.status);
    const statusText = getTransactionStatusText(transaction.status);
    
    col.innerHTML = `
        <div class="card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-1">
                        <i class="fas fa-exchange-alt"></i> Транзакция #${transaction.id}
                    </h6>
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                <p class="card-text">
                    <strong>Отправитель:</strong> ${transaction.sender ? transaction.sender.username : 'Неизвестно'}<br>
                    <strong>Получатель:</strong> ${transaction.receiver ? transaction.receiver.username : 'Неизвестно'}<br>
                    <strong>Сумма:</strong> <span class="text-success">${transaction.amount} C</span><br>
                    <strong>Дата:</strong> ${new Date(transaction.createdAt || transaction.transactionDate).toLocaleString('ru-RU')}
                </p>
                ${transaction.description ? `<p class="card-text"><small>${transaction.description}</small></p>` : ''}
                <div class="d-flex justify-content-between">
                    <small class="text-muted">
                        Баланс до: ${transaction.balanceBefore} C → После: ${transaction.balanceAfter} C
                    </small>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Получить класс статуса транзакции
function getTransactionStatusClass(status) {
    const statusMap = {
        'pending': 'bg-warning',
        'completed': 'bg-success',
        'failed': 'bg-danger',
        'cancelled': 'bg-secondary'
    };
    return statusMap[status] || 'bg-secondary';
}

// Получить текст статуса транзакции
function getTransactionStatusText(status) {
    const statusMap = {
        'pending': 'Ожидает',
        'completed': 'Завершена',
        'failed': 'Ошибка',
        'cancelled': 'Отменена'
    };
    return statusMap[status] || status;
}

// Обработчик создания транзакции
async function handleCreateTransaction(event) {
    event.preventDefault();
    
    try {
        showLoading();
        
        const formData = {
            receiverId: parseInt(document.getElementById('transactionRecipient').value),
            amount: parseFloat(document.getElementById('transactionAmount').value),
            description: document.getElementById('transactionDescription').value
        };
        
        // Валидация
        if (!formData.receiverId) {
            showMessage('warning', 'Выберите получателя');
            return;
        }
        
        if (!formData.amount || formData.amount <= 0) {
            showMessage('warning', 'Введите корректную сумму');
            return;
        }
        
        // Проверка баланса
        if (currentUser && formData.amount > currentUser.cCoinBalance) {
            showMessage('error', 'Недостаточно C-coin на балансе');
            return;
        }
        
        const response = await apiRequest('/transactions', 'POST', formData);
        
        if (response) {
            showMessage('success', 'Транзакция успешно создана!');
            // Закрываем модальное окно
            const modal = bootstrap.Modal.getInstance(document.getElementById('createTransactionModal'));
            modal.hide();
            
            // Очищаем форму
            document.getElementById('createTransactionForm').reset();
            
            // Обновляем данные
            loadTransactions();
            loadUserData(); // Обновить баланс
        }
    } catch (error) {
        console.error('Ошибка создания транзакции:', error);
        showMessage('error', 'Ошибка создания транзакции');
    } finally {
        hideLoading();
    }
}

// Загрузить админ панель БД
async function loadAdminDatabase() {
    try {
        const stats = await apiRequest('/admin/stats', 'GET');
        if (stats) {
            const container = document.getElementById('adminDatabaseContent');
            container.innerHTML = `
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card stats-card text-white">
                            <div class="card-body text-center">
                                <h3>${stats.users}</h3>
                                <p>Пользователей</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card stats-card text-white">
                            <div class="card-body text-center">
                                <h3>${stats.materials}</h3>
                                <p>Материалов</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card stats-card text-white">
                            <div class="card-body text-center">
                                <h3>${stats.advertisements}</h3>
                                <p>Объявлений</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card stats-card text-white">
                            <div class="card-body text-center">
                                <h3>${stats.orders}</h3>
                                <p>Заказов</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h5>Таблицы базы данных</h5>
                    </div>
                    <div class="card-body">
                        <div class="list-group">
                            <a href="#" class="list-group-item list-group-item-action" onclick="loadTableData('users')">
                                <i class="fas fa-users"></i> Пользователи (${stats.users})
                                <button class="btn btn-sm btn-outline-primary float-end" onclick="exportTableToPDF('users', event)">
                                    <i class="fas fa-file-pdf"></i> PDF
                                </button>
                            </a>
                            <a href="#" class="list-group-item list-group-item-action" onclick="loadTableData('materials')">
                                <i class="fas fa-cube"></i> Материалы (${stats.materials})
                                <button class="btn btn-sm btn-outline-primary float-end" onclick="exportTableToPDF('materials', event)">
                                    <i class="fas fa-file-pdf"></i> PDF
                                </button>
                            </a>
                            <a href="#" class="list-group-item list-group-item-action" onclick="loadTableData('advertisements')">
                                <i class="fas fa-bullhorn"></i> Объявления (${stats.advertisements})
                                <button class="btn btn-sm btn-outline-primary float-end" onclick="exportTableToPDF('advertisements', event)">
                                    <i class="fas fa-file-pdf"></i> PDF
                                </button>
                            </a>
                            <a href="#" class="list-group-item list-group-item-action" onclick="loadTableData('orders')">
                                <i class="fas fa-shopping-bag"></i> Заказы (${stats.orders})
                                <button class="btn btn-sm btn-outline-primary float-end" onclick="exportTableToPDF('orders', event)">
                                    <i class="fas fa-file-pdf"></i> PDF
                                </button>
                            </a>
                            <a href="#" class="list-group-item list-group-item-action" onclick="loadTableData('transactions')">
                                <i class="fas fa-exchange-alt"></i> Транзакции (${stats.transactions})
                                <button class="btn btn-sm btn-outline-primary float-end" onclick="exportTableToPDF('transactions', event)">
                                    <i class="fas fa-file-pdf"></i> PDF
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
                
                <div id="tableDataContainer" class="mt-4"></div>
            `;
        }
    } catch (error) {
        console.error('Ошибка загрузки админ панели:', error);
        showMessage('error', 'Ошибка загрузки админ панели');
    }
}

// Загрузить данные таблицы
async function loadTableData(tableName) {
    try {
        const data = await apiRequest(`/admin/table/${tableName}`, 'GET');
        if (data) {
            const container = document.getElementById('tableDataContainer');
            
            let html = `
                <div class="card">
                    <div class="card-header">
                        <h5>Таблица: ${tableName}</h5>
                        <small>Всего записей: ${data.total}</small>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
            `;
            
            // Заголовки таблицы
            if (data.data.length > 0) {
                const headers = Object.keys(data.data[0]);
                headers.forEach(header => {
                    html += `<th>${header}</th>`;
                });
                html += '</tr></thead><tbody>';
                
                // Данные таблицы
                data.data.forEach(row => {
                    html += '<tr>';
                    headers.forEach(header => {
                        let value = row[header];
                        if (value === null || value === undefined) value = '';
                        if (typeof value === 'object') value = JSON.stringify(value);
                        html += `<td>${value}</td>`;
                    });
                    html += '</tr>';
                });
            }
            
            html += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Ошибка загрузки данных таблицы:', error);
        showMessage('error', 'Ошибка загрузки данных таблицы');
    }
}

// Экспортировать таблицу в PDF
async function exportTableToPDF(tableName, event) {
    event.preventDefault();
    event.stopPropagation();
    
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/export/${tableName}`, {
            headers: {
                'x-access-token': authToken
            }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tableName}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showMessage('success', 'PDF файл успешно загружен');
        } else {
            throw new Error('Ошибка экспорта');
        }
    } catch (error) {
        console.error('Ошибка экспорта PDF:', error);
        showMessage('error', 'Ошибка экспорта PDF');
    } finally {
        hideLoading();
    }
}

// Загрузить логи
async function loadAdminLogs() {
    try {
        const logs = await apiRequest('/admin/logs', 'GET');
        if (logs) {
            const container = document.getElementById('adminLogsContent');
            
            let html = '<div class="card"><div class="card-body"><div class="table-container"><table class="table table-striped">';
            html += '<thead><tr><th>Время</th><th>Уровень</th><th>Модуль</th><th>Сообщение</th></tr></thead><tbody>';
            
            logs.forEach(log => {
                const levelClass = log.level === 'error' ? 'danger' : log.level === 'warn' ? 'warning' : 'info';
                html += `
                    <tr>
                        <td>${new Date(log.timestamp).toLocaleString()}</td>
                        <td><span class="badge bg-${levelClass}">${log.level}</span></td>
                        <td>${log.module}</td>
                        <td>${log.message}</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div></div></div>';
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Ошибка загрузки логов:', error);
        showMessage('error', 'Ошибка загрузки логов');
    }
}

// Удалить из корзины
async function removeFromCart(cartItemId) {
    try {
        showLoading();
        await apiRequest(`/cart/${cartItemId}`, 'DELETE');
        showMessage('success', 'Товар удален из корзины');
        loadCart(); // Перезагрузить корзину
        loadUserData(); // Обновить баланс
    } catch (error) {
        console.error('Ошибка удаления из корзины:', error);
        showMessage('error', 'Ошибка удаления из корзины');
    } finally {
        hideLoading();
    }
}

// Оформить заказ
async function checkout() {
    showMessage('info', 'Функция оформления заказа в разработке');
}

// Функции для будущей реализации
function removeItem() {
    showMessage('info', 'Функция в разработке');
}

function editItem() {
    showMessage('info', 'Функция в разработке');
}

function buyItem() {
    showMessage('info', 'Функция в разработке');
}
