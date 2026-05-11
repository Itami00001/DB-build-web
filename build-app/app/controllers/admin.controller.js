const db = require("../models");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get database statistics
exports.getDatabaseStats = async (req, res) => {
  try {
    console.log('🔍 Начало getDatabaseStats');
    const stats = {};

    console.log('🔍 Считаем пользователей...');
    stats.users = await db.user.count();
    console.log('✅ Пользователи:', stats.users);

    console.log('🔍 Считаем категории...');
    stats.materialCategories = await db.materialCategories.count();
    console.log('✅ Категории:', stats.materialCategories);

    console.log('🔍 Считаем материалы...');
    stats.materials = await db.material.count();
    console.log('✅ Материалы:', stats.materials);

    console.log('🔍 Считаем объявления...');
    stats.advertisements = await db.advertisement.count();
    console.log('✅ Объявления:', stats.advertisements);

    console.log('🔍 Считаем заказы...');
    stats.orders = await db.order.count();
    console.log('✅ Заказы:', stats.orders);

    console.log('🔍 Считаем транзакции...');
    stats.transactions = await db.transaction.count();
    console.log('✅ Транзакции:', stats.transactions);

    console.log('🔍 Считаем корзины...');
    stats.carts = await db.cart.count();
    console.log('✅ Корзины:', stats.carts);

    console.log('🔍 Считаем отзывы...');
    stats.reviews = await db.review.count();
    console.log('✅ Отзывы:', stats.reviews);

    console.log('🔍 Считаем общий баланс C-coin...');
    const totalCCoinSupply = await db.user.sum('cCoinBalance');
    stats.totalCCoinSupply = totalCCoinSupply || 0;
    console.log('✅ Общий баланс C-coin:', stats.totalCCoinSupply);

    console.log('🔍 Отправляем результат...');
    res.send(stats);
    console.log('✅ Результат отправлен');
  } catch (error) {
    console.error('❌ Ошибка в getDatabaseStats:', error.message);
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
        const materialCategoriesData = await db.materialCategories.findAndCountAll({
          include: [
            {
              model: db.materialCategories,
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
              model: db.materialCategories,
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
              model: db.materialCategories,
              as: 'category',
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
                  model: db.materialCategories,
                  as: 'category',
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
        // Временно упрощенная логика - только обычные транзакции
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
                  model: db.materialCategories,
                  as: 'category',
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
              model: db.materialCategories,
              as: 'category',
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
        data = await db.materialCategories.findAll({
          include: [
            {
              model: db.materialCategories,
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
              model: db.materialCategories,
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
              model: db.materialCategories,
              as: 'category',
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
              model: db.materialCategories,
              as: 'category',
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

    // Register font with Cyrillic support
    const fontPath = '/usr/share/fonts/dejavu/DejaVuSans.ttf';
    doc.registerFont('MainFont', fontPath);
    doc.font('MainFont');

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
    // Получаем все транзакции и покупки
    const [transactions, orders] = await Promise.all([
      db.transaction.findAll({
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
      }),
      db.order.findAll({
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
                model: db.user,
                as: 'user',
                attributes: ['id', 'username', 'firstName', 'lastName']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      })
    ]);
    
    // Объединяем транзакции и покупки
    const allTransactions = [];
    
    // Добавляем обычные транзакции
    transactions.forEach(transaction => {
      allTransactions.push({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        sender: transaction.sender,
        receiver: transaction.receiver,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.createdAt,
        transactionDate: transaction.transactionDate,
        completedAt: transaction.completedAt,
        referenceType: transaction.referenceType,
        referenceId: transaction.referenceId,
        isPurchase: false
      });
    });
    
    // Добавляем покупки как транзакции
    orders.forEach(order => {
      allTransactions.push({
        id: `order_${order.id}`,
        type: 'purchase',
        amount: order.totalPrice,
        sender: order.user,
        receiver: order.advertisement.user,
        description: `Покупка товара: ${order.advertisement.title}`,
        status: order.status,
        createdAt: order.createdAt,
        orderDate: order.orderDate,
        completedAt: order.createdAt,
        referenceType: 'order',
        referenceId: order.id,
        isPurchase: true,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod
      });
    });
    
    // Сортируем по дате
    allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(allTransactions);
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
          model: db.materialCategories,
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
          model: db.materialCategories,
          as: 'category',
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
