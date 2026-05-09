const jwt = require('jsonwebtoken');
const db = require('../models');

/**
 * Middleware для проверки JWT токена
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    
    if (!token) {
      return res.status(403).json({
        message: 'Токен не предоставлен'
      });
    }

    // Удаляем "Bearer " если он есть
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET || 'build-shop-secret');
    
    // Находим пользователя в базе данных
    const user = await db.user.findByPk(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Аккаунт пользователя деактивирован'
      });
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Недействительный токен'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Срок действия токена истек'
      });
    }

    return res.status(500).json({
      message: 'Ошибка аутентификации',
      error: error.message
    });
  }
};

/**
 * Middleware для проверки роли администратора
 */
const isAdmin = async (req, res, next) => {
  try {
    const user = await db.user.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        message: 'Доступ запрещен. Требуются права администратора'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Ошибка проверки прав доступа',
      error: error.message
    });
  }
};

/**
 * Middleware для проверки роли пользователя или администратора
 */
const isUserOrAdmin = async (req, res, next) => {
  try {
    const user = await db.user.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден'
      });
    }

    if (user.role !== 'admin' && user.role !== 'user') {
      return res.status(403).json({
        message: 'Доступ запрещен'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Ошибка проверки прав доступа',
      error: error.message
    });
  }
};

/**
 * Middleware для проверки владельца ресурса или администратора
 */
const isOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      const user = await db.user.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({
          message: 'Пользователь не найден'
        });
      }

      // Администраторы имеют доступ ко всем ресурсам
      if (user.role === 'admin') {
        return next();
      }

      // Проверяем, является ли пользователь владельцем ресурса
      const resourceUserId = req.params.userId || req.body[resourceUserIdField] || req.query[resourceUserIdField];
      
      if (parseInt(resourceUserId) !== user.id) {
        return res.status(403).json({
          message: 'Доступ запрещен. Вы можете работать только со своими ресурсами'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Ошибка проверки прав доступа',
        error: error.message
      });
    }
  };
};

/**
 * Middleware для проверки достаточного баланса C-коинов
 */
const hasEnoughCoins = (amountField = 'amount') => {
  return async (req, res, next) => {
    try {
      const user = await db.user.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({
          message: 'Пользователь не найден'
        });
      }

      const amount = parseFloat(req.body[amountField]);
      
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          message: 'Некорректная сумма'
        });
      }

      if (parseFloat(user.cCoinBalance) < amount) {
        return res.status(400).json({
          message: 'Недостаточно C-коинов на балансе',
          currentBalance: user.cCoinBalance,
          required: amount
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Ошибка проверки баланса',
        error: error.message
      });
    }
  };
};

module.exports = {
  verifyToken,
  isAdmin,
  isUserOrAdmin,
  isOwnerOrAdmin,
  hasEnoughCoins
};
