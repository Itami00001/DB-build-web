const { verifyToken, isAdmin } = require('./auth.middleware');

/**
 * Middleware для защиты Swagger документации
 * Только администраторы имеют доступ к Swagger
 */
const swaggerProtection = async (req, res, next) => {
  try {
    // Проверяем, является ли запрос к Swagger UI
    if (req.path === '/api-docs' || req.path.startsWith('/api-docs/')) {
      // Для HTML страницы Swagger UI проверяем авторизацию через cookie или query параметр
      if (req.path === '/api-docs') {
        const token = req.query.token || req.cookies?.swaggerToken;
        
        if (!token) {
          return res.status(403).send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Доступ запрещен</title>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
                .error-box { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                h1 { color: #d32f2f; }
              </style>
            </head>
            <body>
              <div class="error-box">
                <h1>Доступ запрещен</h1>
                <p>Доступ к документации Swagger разрешен только администраторам системы.</p>
                <p>Пожалуйста, войдите в систему как администратор и перейдите в панель администратора.</p>
              </div>
            </body>
            </html>
          `);
        }
        
        // Проверяем валидность токена
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'build-shop-secret');
        
        // Находим пользователя в базе данных
        const db = require('../models');
        const user = await db.user.findByPk(decoded.id);
        
        if (!user || user.role !== 'admin') {
          return res.status(403).send('Доступ запрещен. Требуются права администратора.');
        }
      }
    }
    
    next();
  } catch (error) {
    if (req.path === '/api-docs') {
      return res.status(403).send('Недействительный токен доступа.');
    }
    next();
  }
};

/**
 * Middleware для защиты API эндпоинтов Swagger
 */
const swaggerApiProtection = async (req, res, next) => {
  try {
    // Проверяем токен в заголовке
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    
    if (!token) {
      return res.status(403).json({
        message: 'Доступ запрещен. Требуется токен администратора.'
      });
    }
    
    const jwt = require('jsonwebtoken');
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET || 'build-shop-secret');
    
    // Находим пользователя в базе данных
    const db = require('../models');
    const user = await db.user.findByPk(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        message: 'Доступ запрещен. Требуются права администратора.'
      });
    }
    
    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      message: 'Недействительный токен доступа.'
    });
  }
};

module.exports = {
  swaggerProtection,
  swaggerApiProtection
};
