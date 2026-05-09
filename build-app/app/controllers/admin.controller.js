const db = require("../models");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get database statistics
exports.getDatabaseStats = async (req, res) => {
  try {
    const stats = {};

    // Count records in each table
    stats.users = await db.user.count();
    stats.materialCategories = await db.materialCategory.count();
    stats.materials = await db.material.count();
    stats.advertisements = await db.advertisement.count();
    stats.orders = await db.order.count();
    stats.transactions = await db.transaction.count();
    stats.carts = await db.cart.count();
    stats.reviews = await db.review.count();

    // Get financial stats
    const totalTransactions = await db.transaction.sum('amount', {
      where: { status: 'completed' }
    });
    stats.totalTransactionVolume = totalTransactions || 0;

    const totalCCoinSupply = await db.user.sum('cCoinBalance');
    stats.totalCCoinSupply = totalCCoinSupply || 0;

    // Get order stats
    const totalOrders = await db.order.count();
    const completedOrders = await db.order.count({ where: { status: 'delivered' } });
    stats.totalOrders = totalOrders;
    stats.completedOrders = completedOrders;
    stats.orderCompletionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0;

    // Get advertisement stats
    const activeAds = await db.advertisement.count({ where: { status: 'active' } });
    const soldAds = await db.advertisement.count({ where: { status: 'sold' } });
    stats.activeAdvertisements = activeAds;
    stats.soldAdvertisements = soldAds;

    res.send(stats);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения статистики базы данных"
    });
  }
};

// Get all table data
exports.getAllTableData = async (req, res) => {
  try {
    const { tableName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let data = {};
    let total = 0;

    switch (tableName) {
      case 'users':
        const { count: userCount, rows: users } = await db.user.findAndCountAll({
          attributes: { exclude: ['password'] },
          limit,
          offset,
          order: [['createdAt', 'DESC']]
        });
        data = users;
        total = userCount;
        break;

      case 'materialCategories':
        const materialCategoriesData = await db.materialCategory.findAndCountAll({
          include: [
            {
              model: db.materialCategory,
              as: 'parentCategory',
              attributes: ['id', 'name']
            }
          ],
          limit,
          offset,
          order: [['name', 'ASC']]
        });
        data = materialCategoriesData.rows;
        total = materialCategoriesData.count;
        break;

      case 'materials':
        const materialsData = await db.material.findAndCountAll({
          include: [
            {
              model: db.materialCategory,
              as: 'category',
              attributes: ['id', 'name']
            }
          ],
          limit,
          offset,
          order: [['name', 'ASC']]
        });
        data = materialsData.rows;
        total = materialsData.count;
        break;

      case 'advertisements':
        const advertisementsData = await db.advertisement.findAndCountAll({
          include: [
            {
              model: db.material,
              as: 'material',
              attributes: ['id', 'name']
            },
            {
              model: db.user,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ],
          limit,
          offset,
          order: [['createdAt', 'DESC']]
        });
        data = advertisementsData.rows;
        total = advertisementsData.count;
        break;

      case 'orders':
        const ordersData = await db.order.findAndCountAll({
          include: [
            {
              model: db.user,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName']
            },
            {
              model: db.advertisement,
              as: 'advertisement',
              include: [
                {
                  model: db.material,
                  as: 'material',
                  attributes: ['id', 'name']
                }
              ]
            }
          ],
          limit,
          offset,
          order: [['createdAt', 'DESC']]
        });
        data = ordersData.rows;
        total = ordersData.count;
        break;

      case 'transactions':
        const transactionsData = await db.transaction.findAndCountAll({
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
          limit,
          offset,
          order: [['createdAt', 'DESC']]
        });
        data = transactionsData.rows;
        total = transactionsData.count;
        break;

      case 'carts':
        const cartsData = await db.cart.findAndCountAll({
          include: [
            {
              model: db.user,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName']
            },
            {
              model: db.advertisement,
              as: 'advertisement',
              include: [
                {
                  model: db.material,
                  as: 'material',
                  attributes: ['id', 'name']
                }
              ]
            }
          ],
          limit,
          offset,
          order: [['addedAt', 'DESC']]
        });
        data = cartsData.rows;
        total = cartsData.count;
        break;

      case 'reviews':
        const reviewsData = await db.review.findAndCountAll({
          include: [
            {
              model: db.user,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName']
            },
            {
              model: db.material,
              as: 'material',
              attributes: ['id', 'name']
            },
            {
              model: db.advertisement,
              as: 'advertisement',
              attributes: ['id', 'title']
            }
          ],
          limit,
          offset,
          order: [['createdAt', 'DESC']]
        });
        data = reviewsData.rows;
        total = reviewsData.count;
        break;

      default:
        return res.status(400).send({
          message: "Неверное имя таблицы"
        });
    }

    res.send({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения данных таблицы"
    });
  }
};

// Export table data to PDF
exports.exportTableToPDF = async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Get all data for export
    let data = [];
    let fileName = '';
    let title = '';

    switch (tableName) {
      case 'users':
        data = await db.user.findAll({
          attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'phone', 'role', 'cCoinBalance', 'isActive', 'createdAt'],
          order: [['id', 'ASC']]
        });
        fileName = 'users.pdf';
        title = 'Пользователи';
        break;

      case 'materialCategories':
        data = await db.materialCategory.findAll({
          include: [
            {
              model: db.materialCategory,
              as: 'parentCategory',
              attributes: ['name']
            }
          ],
          order: [['name', 'ASC']]
        });
        fileName = 'material-categories.pdf';
        title = 'Категории материалов';
        break;

      case 'materials':
        data = await db.material.findAll({
          include: [
            {
              model: db.materialCategory,
              as: 'category',
              attributes: ['name']
            }
          ],
          order: [['name', 'ASC']]
        });
        fileName = 'materials.pdf';
        title = 'Материалы';
        break;

      case 'advertisements':
        data = await db.advertisement.findAll({
          include: [
            {
              model: db.material,
              as: 'material',
              attributes: ['name']
            },
            {
              model: db.user,
              as: 'user',
              attributes: ['username']
            }
          ],
          order: [['id', 'ASC']]
        });
        fileName = 'advertisements.pdf';
        title = 'Объявления';
        break;

      case 'orders':
        data = await db.order.findAll({
          include: [
            {
              model: db.user,
              as: 'user',
              attributes: ['username']
            },
            {
              model: db.advertisement,
              as: 'advertisement',
              include: [
                {
                  model: db.material,
                  as: 'material',
                  attributes: ['name']
                }
              ]
            }
          ],
          order: [['id', 'ASC']]
        });
        fileName = 'orders.pdf';
        title = 'Заказы';
        break;

      case 'transactions':
        data = await db.transaction.findAll({
          include: [
            {
              model: db.user,
              as: 'sender',
              attributes: ['username']
            },
            {
              model: db.user,
              as: 'receiver',
              attributes: ['username']
            }
          ],
          order: [['id', 'ASC']]
        });
        fileName = 'transactions.pdf';
        title = 'Транзакции';
        break;

      case 'carts':
        data = await db.cart.findAll({
          include: [
            {
              model: db.user,
              as: 'user',
              attributes: ['username']
            },
            {
              model: db.advertisement,
              as: 'advertisement',
              include: [
                {
                  model: db.material,
                  as: 'material',
                  attributes: ['name']
                }
              ]
            }
          ],
          order: [['id', 'ASC']]
        });
        fileName = 'carts.pdf';
        title = 'Корзины';
        break;

      case 'reviews':
        data = await db.review.findAll({
          include: [
            {
              model: db.user,
              as: 'user',
              attributes: ['username']
            },
            {
              model: db.material,
              as: 'material',
              attributes: ['name']
            },
            {
              model: db.advertisement,
              as: 'advertisement',
              attributes: ['title']
            }
          ],
          order: [['id', 'ASC']]
        });
        fileName = 'reviews.pdf';
        title = 'Отзывы';
        break;

      default:
        return res.status(400).send({
          message: "Неверное имя таблицы"
        });
    }

    // Create PDF
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', (chunk) => {
      chunks.push(chunk);
    });

    doc.on('end', () => {
      const pdfData = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(pdfData);
    });

    // Add content to PDF
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Дата экспорта: ${new Date().toLocaleString('ru-RU')}`, { align: 'center' });
    doc.moveDown();

    // Add table data
    if (data.length > 0) {
      // Headers
      const headers = Object.keys(data[0].toJSON ? data[0].toJSON() : data[0]);
      const tableTop = doc.y;

      // Draw headers
      let x = 50;
      headers.forEach((header, index) => {
        doc.fontSize(8).text(header, x, tableTop, { width: 100 });
        x += 100;
      });

      doc.moveDown();

      // Draw data rows
      data.forEach((row) => {
        const rowData = row.toJSON ? row.toJSON() : row;
        let x = 50;
        
        headers.forEach((header) => {
          let value = rowData[header];
          
          // Handle nested objects
          if (typeof value === 'object' && value !== null) {
            if (value.name) value = value.name;
            else if (value.username) value = value.username;
            else if (value.title) value = value.title;
            else value = JSON.stringify(value);
          }
          
          // Handle dates
          if (value instanceof Date) {
            value = value.toLocaleDateString('ru-RU');
          }
          
          // Handle null/undefined
          if (value === null || value === undefined) {
            value = '';
          }
          
          doc.fontSize(8).text(String(value), x, doc.y, { width: 100 });
          x += 100;
        });
        
        doc.moveDown();
      });
    } else {
      doc.text('Нет данных для экспорта');
    }

    doc.end();

  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка экспорта данных в PDF"
    });
  }
};

// Get application logs
exports.getLogs = async (req, res) => {
  try {
    // This is a simplified version - in production, you would read from actual log files
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Сервер запущен успешно',
        module: 'server'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'База данных синхронизирована',
        module: 'database'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'warn',
        message: 'Пользователь test1 попытался получить доступ к админ панели',
        module: 'auth'
      }
    ];

    res.send(logs);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения логов"
    });
  }
};

// Stats functions for admin API
exports.getUsersStats = async (req, res) => {
  try {
    const count = await db.user.count();
    res.json({ count });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения статистики пользователей"
    });
  }
};

exports.getMaterialsStats = async (req, res) => {
  try {
    const count = await db.material.count();
    res.json({ count });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения статистики материалов"
    });
  }
};

exports.getAdvertisementsStats = async (req, res) => {
  try {
    const count = await db.advertisement.count();
    res.json({ count });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения статистики объявлений"
    });
  }
};

exports.getTransactionsStats = async (req, res) => {
  try {
    const count = await db.transaction.count();
    res.json({ count });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения статистики транзакций"
    });
  }
};

// Get all data functions
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.user.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения пользователей"
    });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await db.transaction.findAll({
      include: [
        {
          model: db.user,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: db.user,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['transactionDate', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения транзакций"
    });
  }
};

exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await db.material.findAll({
      include: [
        {
          model: db.materialCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });
    res.json(materials);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения материалов"
    });
  }
};

exports.getAllAdvertisements = async (req, res) => {
  try {
    const advertisements = await db.advertisement.findAll({
      include: [
        {
          model: db.material,
          as: 'material',
          attributes: ['id', 'name']
        },
        {
          model: db.user,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(advertisements);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения объявлений"
    });
  }
};

// System logs for debug
exports.getSystemLogs = async (req, res) => {
  try {
    const logs = [
      `[${new Date().toISOString()}] INFO: Сервер запущен на порту 3000`,
      `[${new Date().toISOString()}] INFO: База данных PostgreSQL подключена`,
      `[${new Date().toISOString()}] INFO: Swagger документация доступна на /api-docs`,
      `[${new Date().toISOString()}] WARN: Пользователь test1 попытался получить доступ к админ панели`,
      `[${new Date().toISOString()}] INFO: Новая транзакция C-коинов создана`,
      `[${new Date().toISOString()}] ERROR: Ошибка подключения к внешнему API`
    ];
    res.json(logs);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения системных логов"
    });
  }
};

// User management functions
exports.rewardUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;
    
    const user = await db.user.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: 'Пользователь не найден' });
    }
    
    const TransactionService = require('../services/transaction.service');
    await TransactionService.rewardUser(req.userId, userId, amount, description);
    
    res.send({ message: 'Награда успешно выдана' });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка выдачи награды"
    });
  }
};

exports.updateUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { balance } = req.body;
    
    const user = await db.user.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: 'Пользователь не найден' });
    }
    
    await user.update({ cCoinBalance: balance });
    
    res.send({ message: 'Баланс пользователя обновлен' });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления баланса"
    });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    const user = await db.user.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: 'Пользователь не найден' });
    }
    
    await user.update({ isActive });
    
    res.send({ message: 'Статус пользователя обновлен' });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления статуса"
    });
  }
};
