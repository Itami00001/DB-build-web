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
                // Добавляем задержку чтобы убедиться, что DOM элементы готовы
                setTimeout(() => {
                    updateUIForLoggedInUser();
                    // Асинхронно проверяем токен на сервере
                    validateTokenAndLoadData();
                }, 100);
            } else {
                clearAuthData();
                showPage('home');
                loadFeaturedMaterials();
            }
        } catch (error) {
            console.error('Ошибка парсинга пользователя из localStorage:', error);
            clearAuthData();
            showPage('home');
            loadFeaturedMaterials();
        }
    } else {
        // Если нет токена, показываем главную страницу
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
            case 'admin':
                showAdminPage();
                break;
            case 'database':
                showAdminDatabasePage();
                break;
            case 'debug':
                showAdminLogsPage();
                break;
            case 'swagger':
                window.open('http://localhost:3000/api-docs', '_blank');
                break;
            case 'createAdvertisement':
                loadCreateAdvertisementForm();
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
    
    console.log('Обновление UI для пользователя:', currentUser.username, 'Роль:', currentUser.role);
    // Скрыть элементы для неавторизованных пользователей
    const authNav = document.getElementById('authNav');
    const userNav = document.getElementById('userNav');
    
    if (authNav) authNav.style.display = 'none';
    if (userNav) userNav.style.display = 'block';
    
    // Показать админ панель для администратора
    if (currentUser.role === 'admin') {
        const adminNav = document.getElementById('adminNav');
        if (adminNav) {
            adminNav.style.display = 'block';
        }
    }
    
    // Обновить имя пользователя и баланс
    const usernameElement = document.getElementById('username');
    const cCoinBalanceElement = document.getElementById('cCoinBalance');
    
    if (usernameElement) {
        usernameElement.textContent = currentUser.username;
    }
    
    if (cCoinBalanceElement) {
        const balance = parseFloat(currentUser.cCoinBalance || 0).toFixed(2);
        cCoinBalanceElement.textContent = `${balance} C`;
    }
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
        
        // Проверяем токен более тщательно - не очищаем валидные токены
        if (!token) {
            console.warn('Токен отсутствует в localStorage');
        } else if (token.length < 5) {
            console.warn('Слишком короткий токен в localStorage, очищаем...');
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
            // Проверяем, что ID пользователя совпадают (более надежно чем username)
            if (response.id === currentUser.id) {
                currentUser = response;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateUIForLoggedInUser();
                
                console.log('✅ Пользователь подтвержден, баланс:', currentUser.cCoinBalance);
                
                // Дополнительная проверка для администратора
                await validateAdminUser();
            } else {
                console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Несоответствие ID пользователя! Local:', currentUser.id, 'Server:', response.id);
                console.error('❌ Это может быть попытка подмены сессии, разлогиниваем...');
                // При несоответствии ID - разлогиниваем (возможна подмена сессии)
                clearAuthData();
                showPage('home');
                loadFeaturedMaterials();
                showMessage('error', 'Ошибка безопасности. Пожалуйста, войдите снова.');
                return;
            }
        }
    } catch (error) {
        console.error('Ошибка валидации токена:', error);
        // Разлогиниваем только при явной ошибке авторизации, не при сетевых проблемах
        if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
            console.warn('Токен невалидный, разлогиниваем...');
            clearAuthData();
            showPage('home');
            loadFeaturedMaterials();
            showMessage('warning', 'Сессия истекла. Пожалуйста, войдите снова.');
        } else {
            // При сетевых ошибках не разлогиниваем, просто показываем предупреждение
            console.warn('Временная ошибка сети, сохраняем сессию');
            showMessage('warning', 'Проблемы с подключением. Сессия сохранена.');
        }
    }
}

// Проверка пользователя admin/adminadmin в базе данных
async function validateAdminUser() {
    console.log('validateAdminUser вызвана. currentUser:', currentUser);

    if (!currentUser || !currentUser.username) {
        console.log('currentUser не существует, выходим из validateAdminUser');
        return;
    }

    try {
        // Проверяем, является ли пользователь администратором
        // Если role undefined, проверяем только по username
        const isAdmin = currentUser.username === 'admin' && (currentUser.role === 'admin' || !currentUser.role);
        if (isAdmin) {
            console.log('✅ Пользователь admin подтвержден');
            console.log('✅ Админ-панель будет показана через updateUIForLoggedInUser');
        } else {
            console.log('Пользователь не admin:', currentUser.username, currentUser.role);
        }
    } catch (error) {
        console.error('❌ Ошибка проверки администратора:', error);
        if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
            clearAuthData();
            showPage('home');
            showMessage('error', 'Сессия истекла. Пожалуйста, войдите снова.');
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

// Создать элемент корзины
function createCartItem(item) {
    const col = document.createElement('div');
    col.className = 'col-md-12 mb-3';
    
    // Валидация данных элемента корзины
    if (!item || !item.id || !item.advertisementId) {
        console.error('❌ Некорректный элемент корзины:', item);
        return col; // Возвращаем пустой элемент
    }
    
    col.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="card-title mb-1">${item.advertisement?.title || 'Товар'}</h5>
                        <p class="card-text mb-1">
                            <strong>Цена: ${item.price} C</strong>
                        </p>
                        <p class="card-text mb-1">
                            <small>Количество: ${item.quantity || 0}</small>
                        </p>
                        <p class="card-text mb-1">
                            <small>Продавец: ${item.advertisement?.user?.username || 'Не указан'}</small>
                        </p>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i> Убрать
                        </button>
                        <button class="btn btn-success btn-sm" onclick="buyFromCart(${item.id}, ${item.advertisementId})">
                            <i class="fas fa-shopping-bag"></i> Купить
                        </button>
                    </div>
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
    
    // Проверяем статус объявления
    const isInactive = advertisement.status === 'sold' || advertisement.status === 'inactive';
    const isOwnAdvertisement = currentUser && advertisement.userId === currentUser.id;
    
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
                <div class="d-flex justify-content-between align-items-center mb-2">
                    ${isInactive ? 
                        '<span class="badge bg-danger">Не активно</span>' : 
                        '<span class="badge bg-success">Активно</span>'
                    }
                </div>
                <div class="d-flex justify-content-between">
                    ${isInactive ? 
                        '<span class="badge bg-danger">Продано</span>' : 
                        (isOwnAdvertisement ? 
                            '<span class="badge bg-secondary">Ваше объявление</span>' : 
                            '<button class="btn btn-success btn-sm" onclick="addToCart(' + advertisement.id + ')"><i class="fas fa-shopping-cart"></i> Добавить в корзину</button>'
                        )
                    }
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
function getStatusClass(status) {
    const classes = {
        'pending': 'bg-warning text-dark',
        'confirmed': 'bg-success text-white',
        'rejected': 'bg-danger text-white',
        'shipped': 'bg-info text-white',
        'delivered': 'bg-primary text-white',
        'cancelled': 'bg-danger text-white',
        'refunded': 'bg-secondary text-white',
        'active': 'bg-success',
        'sold': 'bg-danger',
        'inactive': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary text-white';
}

function getStatusText(status) {
    const texts = {
        'pending': 'В обработке',
        'confirmed': 'Одобрено',
        'rejected': 'Не одобрено',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен',
        'refunded': 'Возврат',
        'active': 'Активно',
        'sold': 'Продано',
        'inactive': 'Неактивно'
    };
    return texts[status] || status;
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
            options.headers['Authorization'] = `Bearer ${authToken}`;
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

// Обновить счетчики транзакций во всех местах
async function updateTransactionCounters() {
    try {
        // Обновляем счетчик на главной странице
        const database = await apiRequest('/admin/database', 'GET');
        const stats = database.stats || database;
        if (stats && stats.transactions !== undefined) {
            const totalTransactionsElement = document.getElementById('totalTransactions');
            if (totalTransactionsElement) {
                totalTransactionsElement.textContent = stats.transactions;
            }
        }
    } catch (error) {
        console.error('Ошибка обновления счетчиков транзакций:', error);
    }
}

// Обновить все представления транзакций
function updateAllTransactionViews() {
    // Обновляем главную страницу если она открыта
    const homePage = document.getElementById('homePage');
    if (homePage && homePage.style.display !== 'none') {
        loadHomePage();
    }
    
    // Обновляем Admin панель если она открыта
    const adminDatabasePage = document.getElementById('adminDatabaseContent');
    if (adminDatabasePage) {
        showAdminDatabasePage();
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
        // Запрашиваем все объявления без ограничений пагинации и фильтрации по статусу
        const timestamp = Date.now();
        const response = await apiRequest(`/advertisements?limit=100&status=all&t=${timestamp}`, 'GET');
        
        // Временная диагностика
        console.log('API Response:', response);
        console.log('Response type:', typeof response);
        console.log('Is array:', Array.isArray(response));
        
        // Извлекаем массив объявлений из ответа
        const data = response.advertisements || response;
        console.log('Data after extraction:', data);
        console.log('Data length:', data ? data.length : 'undefined');
        
        const container = document.getElementById('advertisementsList');
        const noAds = document.getElementById('noAdvertisements');
        
        container.innerHTML = '';
        
        // API возвращает массив объявлений напрямую
        if (data && Array.isArray(data) && data.length > 0) {
            console.log(`Processing ${data.length} advertisements`);
            noAds.style.display = 'none';
            data.forEach((advertisement, index) => {
                console.log(`Ad ${index}:`, advertisement.id, advertisement.title);
                const card = createAdvertisementCard(advertisement);
                container.appendChild(card);
            });
            console.log(`Added ${container.children.length} cards to container`);
        } else {
            console.log('No advertisements found');
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
        
        // API может возвращать массив напрямую или объект с полем cartItems
        const cartItems = Array.isArray(data) ? data : (data.cartItems || []);
        
        if (cartItems.length > 0) {
            emptyCart.style.display = 'none';
            let total = 0;
            let itemsCount = 0;
            
            cartItems.forEach(item => {
                const cartItem = createCartItem(item);
                container.appendChild(cartItem);
                total += item.price * item.quantity;
                itemsCount += item.quantity;
            });
            
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
        console.error('Ошибка загрузки покупок:', error);
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
                <p class="mb-1"><strong>Сумма:</strong> ${parseFloat(order.totalPrice).toFixed(2)} C</p>
                <p class="mb-1"><strong>Количество:</strong> ${parseFloat(order.quantity).toFixed(2)}</p>
                <div class="mt-2">
                    <small class="text-muted">
                        <strong>Товар:</strong> ${order.advertisement?.title || 'Неизвестный товар'}
                    </small>
                </div>
                <div class="mt-2">
                    <small class="text-muted">
                        <strong>Материал:</strong> ${order.advertisement?.material?.name || 'Не указан'}
                    </small>
                </div>
                <div class="mt-2">
                    <small class="text-muted">
                        <strong>Продавец:</strong> ${order.advertisement?.user?.username || 'Не указан'}
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
        const response = await apiRequest('/cart', 'POST', { advertisementId, quantity: 1 });
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

// Купить товар из корзины
async function buyFromCart(cartItemId, advertisementId) {
    try {
        showLoading();
        
        // Валидация cartItemId
        if (!cartItemId || isNaN(parseInt(cartItemId))) {
            throw new Error('Некорректный ID элемента корзины');
        }

        const response = await apiRequest('/orders', 'POST', {
            cartItemIds: [cartItemId],
            paymentMethod: 'c-coin',
            deliveryAddress: {},
            notes: ''
        });

        if (response) {
            showMessage('success', 'Товар успешно куплен!');
            await loadCart();
            await validateTokenAndLoadData();
            loadAdvertisements();
            loadOrders();
            loadTransactions(); // Обновляем транзакции
            updateTransactionCounters(); // Обновляем счетчики
        }
    } catch (error) {
        console.error('Ошибка покупки:', error);
        showMessage('error', 'Ошибка покупки');
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
        const response = await apiRequest('/transactions', 'GET');
        
        // Извлекаем массив транзакций из ответа
        const data = response.transactions || response;
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
    
    // Определяем тип транзакции
    const isPurchase = transaction.isPurchase || transaction.type === 'purchase';
    const transactionId = isPurchase && typeof transaction.id === 'string' ? transaction.id.replace('order_', '') : transaction.id;
    const icon = isPurchase ? 'fa-shopping-cart' : 'fa-exchange-alt';
    const title = isPurchase ? `Покупка #${transactionId}` : `Транзакция #${transaction.id}`;
    
    col.innerHTML = `
        <div class="card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-1">
                        <i class="fas ${icon}"></i> ${title}
                    </h6>
                    <span class="badge ${statusClass}">${statusText}</span>
                    ${isPurchase ? '<span class="badge bg-info text-white">Покупка</span>' : ''}
                </div>
                <p class="card-text">
                    <strong>Отправитель:</strong> ${transaction.sender ? transaction.sender.username : 'Неизвестно'}<br>
                    <strong>Получатель:</strong> ${transaction.receiver ? transaction.receiver.username : 'Неизвестно'}<br>
                    <strong>Сумма:</strong> <span class="text-success">${transaction.amount} C</span><br>
                    <strong>Дата:</strong> ${new Date(transaction.createdAt || transaction.transactionDate).toLocaleString('ru-RU')}
                    ${transaction.paymentMethod ? `<br><strong>Способ оплаты:</strong> ${transaction.paymentMethod === 'c-coin' ? 'C-coin' : transaction.paymentMethod}` : ''}
                </p>
                ${transaction.description ? `<p class="card-text"><small>${transaction.description}</small></p>` : ''}
                ${transaction.balanceBefore !== undefined ? `
                <div class="d-flex justify-content-between">
                    <small class="text-muted">
                        Баланс до: ${transaction.balanceBefore} C → После: ${transaction.balanceAfter} C
                    </small>
                </div>` : ''}
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
        'cancelled': 'bg-secondary',
        // Статусы заказов
        'confirmed': 'bg-success text-white',
        'rejected': 'bg-danger text-white',
        'shipped': 'bg-info text-white',
        'delivered': 'bg-primary text-white',
        'refunded': 'bg-secondary text-white'
    };
    return statusMap[status] || 'bg-secondary';
}

// Получить текст статуса транзакции
function getTransactionStatusText(status) {
    const statusMap = {
        'pending': 'Ожидает',
        'completed': 'Завершена',
        'failed': 'Ошибка',
        'cancelled': 'Отменена',
        // Статусы заказов
        'confirmed': 'Одобрено',
        'rejected': 'Не одобрено',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'refunded': 'Возврат'
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
            updateTransactionCounters(); // Обновить счетчики транзакций
            
            // Принудительное обновление всех мест с транзакциями
            setTimeout(() => {
                updateAllTransactionViews();
            }, 500);
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
        // Для транзакций используем специальный маршрут
        const endpoint = tableName === 'transactions' ? '/admin/transactions' : `/admin/table/${tableName}`;
        const data = await apiRequest(endpoint, 'GET');
        if (data) {
            const container = document.getElementById('tableDataContainer');
            
            // Для транзакций data - это массив, для других таблиц - объект с полем data
            const tableData = Array.isArray(data) ? data : data.data;
            const totalRecords = Array.isArray(data) ? data.length : data.total;
            
            let html = `
                <div class="card">
                    <div class="card-header">
                        <h5>Таблица: ${tableName}</h5>
                        <small>Всего записей: ${totalRecords}</small>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
            `;
            
            // Заголовки таблицы
            if (tableData.length > 0) {
                const headers = Object.keys(tableData[0]);
                headers.forEach(header => {
                    html += `<th>${header}</th>`;
                });
                html += '</tr></thead><tbody>';
                
                // Данные таблицы
                tableData.forEach(row => {
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
    showMessage('info', 'Используйте корзину для покупки товаров');
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

// Админ-панель функции
async function loadAdminDatabase() {
    try {
        const data = await apiRequest('/admin/database', 'GET');
        displayDatabase(data);
    } catch (error) {
        console.error('Ошибка загрузки базы данных:', error);
        showMessage('error', 'Ошибка загрузки базы данных');
    }
}

async function loadAdminLogs() {
    try {
        const data = await apiRequest('/admin/logs', 'GET');
        displayLogs(data);
    } catch (error) {
        console.error('Ошибка загрузки логов:', error);
        showMessage('error', 'Ошибка загрузки логов');
    }
}

function displayDatabase(data) {
    const container = document.getElementById('adminDatabaseContent');
    if (!container) return;
    
    let html = '<div class="row">';
    
    // Плитка Пользователи
    html += `
        <div class="col-md-12 mb-4">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="fas fa-users"></i> Пользователи (${data.users ? data.users.length : 0})</h5>
                    <button class="btn btn-outline-primary btn-sm" onclick="exportToPDF('users', event)">
                        <i class="fas fa-file-pdf"></i> Скачать PDF
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Имя</th>
                                    <th>Email</th>
                                    <th>Баланс C</th>
                                    <th>Роль</th>
                                    <th>Статус</th>
                                    <th>Создан</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.users ? data.users.map(user => `
                                    <tr>
                                        <td>${user.id}</td>
                                        <td>${user.firstName} ${user.lastName}</td>
                                        <td>${user.email}</td>
                                        <td class="${user.cCoinBalance < 0 ? 'text-danger' : 'text-success'}">${user.cCoinBalance}</td>
                                        <td><span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}">${user.role}</span></td>
                                        <td><span class="badge ${user.isActive ? 'bg-success' : 'bg-secondary'}">${user.isActive ? 'Активен' : 'Неактивен'}</span></td>
                                        <td>${new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="7" class="text-center">Нет данных</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Плитка Объявления
    html += `
        <div class="col-md-12 mb-4">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="fas fa-bullhorn"></i> Объявления (${data.advertisements ? data.advertisements.length : 0})</h5>
                    <button class="btn btn-outline-primary btn-sm" onclick="exportToPDF('advertisements', event)">
                        <i class="fas fa-file-pdf"></i> Скачать PDF
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th>Цена C</th>
                                    <th>Количество</th>
                                    <th>Статус</th>
                                    <th>Пользователь</th>
                                    <th>Создано</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.advertisements ? data.advertisements.map(ad => `
                                    <tr>
                                        <td>${ad.id}</td>
                                        <td>${ad.title}</td>
                                        <td class="text-success">${ad.price}</td>
                                        <td>${ad.quantity}</td>
                                        <td><span class="badge ${ad.status === 'active' ? 'bg-success' : 'bg-secondary'}">${ad.status}</span></td>
                                        <td>${ad.userId}</td>
                                        <td>${new Date(ad.createdAt).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="7" class="text-center">Нет данных</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Плитка Транзакции
    html += `
        <div class="col-md-12 mb-4">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="fas fa-exchange-alt"></i> Транзакции (${data.transactions ? data.transactions.length : 0})</h5>
                    <button class="btn btn-outline-primary btn-sm" onclick="exportToPDF('transactions', event)">
                        <i class="fas fa-file-pdf"></i> Скачать PDF
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Отправитель</th>
                                    <th>Получатель</th>
                                    <th>Сумма C</th>
                                    <th>Описание</th>
                                    <th>Статус</th>
                                    <th>Дата</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.transactions ? data.transactions.map(tx => `
                                    <tr>
                                        <td>${tx.id}</td>
                                        <td>${tx.sender ? tx.sender.username : 'N/A'}</td>
                                        <td>${tx.receiver ? tx.receiver.username : 'N/A'}</td>
                                        <td class="text-success">${tx.amount}</td>
                                        <td>${tx.description || '-'}</td>
                                        <td><span class="badge ${tx.status === 'completed' ? 'bg-success' : 'bg-warning'}">${tx.status}</span></td>
                                        <td>${new Date(tx.createdAt).toLocaleDateString('ru-RU')}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="7" class="text-center">Нет данных</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    html += '</div>';
    container.innerHTML = html;
}

function displayLogs(logs) {
    const container = document.getElementById('adminLogsContent');
    if (!container) return;
    
    let html = '<div class="row">';
    
    // Секция логов
    html += `
        <div class="col-md-12 mb-4">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-list"></i> Системные логи</h5>
                </div>
                <div class="card-body">
                    <div class="logs-container">
    `;
    
    logs.forEach(log => {
        const levelClass = getLogLevelClass(log.level);
        const time = new Date(log.timestamp).toLocaleString('ru-RU');
        
        html += `
            <div class="log-entry ${levelClass}">
                <div class="log-header">
                    <span class="log-time">${time}</span>
                    <span class="log-level">${log.level.toUpperCase()}</span>
                    <span class="log-source">${log.source}</span>
                </div>
                <div class="log-message">${log.message}</div>
            </div>
        `;
    });
    
    html += `
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Секция терминала
    html += `
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-terminal"></i> Терминал</h5>
                </div>
                <div class="card-body">
                    <div id="terminalContainer">
                        <div id="terminalOutput" class="terminal-output mb-3"></div>
                        <button class="btn btn-outline-primary" onclick="loadTerminalEvents()">
                            <i class="fas fa-sync-alt"></i> Обновить Терминал
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    html += '</div>';
    container.innerHTML = html;
    
    // Настраиваем терминал с задержкой для гарантии загрузки DOM
    setTimeout(() => {
        setupTerminal();
    }, 100);
}

function getLogLevelClass(level) {
    const classes = {
        'error': 'log-error',
        'warn': 'log-warn',
        'info': 'log-info',
        'debug': 'log-debug'
    };
    return classes[level] || 'log-info';
}

function setupTerminal() {
    const output = document.getElementById('terminalOutput');
    
    console.log('Настройка терминала...');
    console.log('output:', output);
    
    if (!output) {
        console.error('Элемент terminalOutput не найден!');
        return;
    }
    
    // Загружаем начальные события терминала
    console.log('Загрузка начальных событий терминала...');
    loadTerminalEvents();
    
    console.log('Терминал настроен успешно');
}

async function loadTerminalEvents() {
    try {
        console.log('Загрузка событий терминала...');
        const events = await apiRequest('/admin/terminal/events', 'GET');
        console.log('Получены события:', events);
        displayTerminalEvents(events);
    } catch (error) {
        console.error('Ошибка загрузки событий терминала:', error);
    }
}

function displayTerminalEvents(events) {
    const output = document.getElementById('terminalOutput');
    console.log('Отображение событий терминала...');
    console.log('output элемент:', output);
    console.log('events:', events);
    
    if (!output) {
        console.error('Элемент terminalOutput не найден!');
        return;
    }
    
    let html = '';
    
    // Если нет событий, добавляем тестовое сообщение
    if (!events || events.length === 0) {
        html += `<div class="terminal-event terminal-info">
            <span class="terminal-time">[${new Date().toLocaleTimeString('ru-RU')}]</span>
            <span class="terminal-icon">ℹ️</span>
            <span class="terminal-message">Терминал инициализирован. Ожидание событий...</span>
        </div>`;
    } else {
        events.forEach(event => {
            const time = new Date(event.timestamp).toLocaleTimeString('ru-RU');
            const typeClass = getTerminalTypeClass(event.type);
            
            if (event.message.startsWith('$ ')) {
                // Команда пользователя
                html += `<div class="terminal-line">
                    <span class="terminal-time">[${time}]</span>
                    <span class="terminal-prompt">$</span>
                    <span class="terminal-command">${event.message.substring(2)}</span>
                </div>`;
            } else {
                // Системное событие
                const icon = getTerminalIcon(event.type);
                html += `<div class="terminal-event ${typeClass}">
                    <span class="terminal-time">[${time}]</span>
                    <span class="terminal-icon">${icon}</span>
                    <span class="terminal-message">${event.message}</span>
                </div>`;
            }
        });
    }
    
    console.log('Сгенерированный HTML:', html);
    output.innerHTML = html;
    output.scrollTop = output.scrollHeight;
    console.log('События терминала отображены');
}

function getTerminalTypeClass(type) {
    const classes = {
        'system': 'terminal-system',
        'process': 'terminal-process',
        'success': 'terminal-success',
        'error': 'terminal-error',
        'info': 'terminal-info'
    };
    return classes[type] || 'terminal-info';
}

function getTerminalIcon(type) {
    const icons = {
        'system': '⚙️',
        'process': '⏳',
        'success': '✅',
        'error': '❌',
        'info': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

function showAdminPage() {
    const container = document.getElementById('adminContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="admin-dashboard">
            <div class="row mb-4">
                <div class="col-md-12">
                    <h2><i class="fas fa-cogs"></i> Панель администратора</h2>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-database"></i> База данных</h5>
                        </div>
                        <div class="card-body">
                            <div id="databaseContent">
                                <div class="text-center py-4">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <p>Загрузка базы данных...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-bug"></i> Отладка</h5>
                        </div>
                        <div class="card-body">
                            <div id="debugContent">
                                <div class="text-center py-4">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <p>Загрузка логов...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-terminal"></i> Терминал</h5>
                        </div>
                        <div class="card-body">
                            <div id="terminalContainer">
                                <div id="terminalOutput" class="terminal-output mb-3"></div>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="text" id="terminalInput" class="form-control" placeholder="Введите команду..." autocomplete="off">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Автоматически загружаем данные при открытии админ-панели
    loadAdminDatabase();
    loadAdminLogs();
}

function showAdminDatabasePage() {
    const container = document.getElementById('adminDatabaseContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-4">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Загрузка базы данных...</p>
        </div>
    `;
    
    loadAdminDatabase();
}

function showAdminLogsPage() {
    const container = document.getElementById('adminLogsContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-4">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Загрузка логов...</p>
        </div>
    `;
    
    loadAdminLogs();
}

function exportToPDF(type, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    showMessage('info', `Создание PDF для ${type}...`);
    
    // В реальном приложении здесь будет генерация PDF
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`Данные для ${type} успешно экспортированы`)}`;
        link.download = `${type}_export.txt`;
        link.click();
        
        showMessage('success', `PDF для ${type} успешно создан`);
    }, 1000);
}
