const db = require("../models");
const Advertisement = db.advertisement;
const Material = db.material;
const User = db.user;
const { Op } = db.Sequelize;

// Create advertisement
exports.create = async (req, res) => {
  try {
    const { title, description, categoryId, price, quantity, location, images, contactInfo } = req.body;

    // Check if category exists
    const MaterialCategory = db.materialCategories;
    const category = await MaterialCategory.findByPk(categoryId);
    if (!category) {
      return res.status(404).send({
        message: "Категория не найдена"
      });
    }

    // Check if user has enough C-coin balance
    const user = await User.findByPk(req.userId);
    if (user.cCoinBalance < 10) { // 10 C-coin fee for creating advertisement
      return res.status(400).send({
        message: "Недостаточно C-coin для создания объявления (требуется 10 C-coin)"
      });
    }

    // Create advertisement (simplified version for testing)
    const newAd = await Advertisement.create({
      title,
      description,
      categoryId,
      userId: req.userId,
      price,
      quantity,
      location,
      images: images || [],
      contactInfo: contactInfo || {},
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // Deduct C-coin fee - temporarily disabled for testing
    // await user.update({
    //   cCoinBalance: parseFloat(user.cCoinBalance) - 10
    // });

    const advertisement = newAd;

      
    res.status(201).send({
      message: "Объявление успешно создано",
      advertisement
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка создания объявления"
    });
  }
};

// Get all advertisements
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const categoryId = req.query.categoryId;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const status = req.query.status;
    const userId = req.query.userId;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'DESC';

    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (userId) {
      where.userId = userId;
    }

    const include = [
      {
        model: db.materialCategories,
        as: 'category',
        attributes: ['id', 'name']
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }
    ];

    // Filter by category
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    const { count, rows } = await Advertisement.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    
    res.send({
      advertisements: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения объявлений"
    });
  }
};

// Get advertisement by ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    const advertisement = await Advertisement.findByPk(id, {
      include: [
        {
          model: db.materialCategories,
          as: 'category',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'phone']
        },
        {
          model: db.review,
          as: 'reviews',
          include: [
            {
              model: db.user,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ],
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!advertisement) {
      return res.status(404).send({
        message: "Объявление не найдено"
      });
    }

    // Increment views
    await advertisement.increment('views');

    res.send(advertisement);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения объявления"
    });
  }
};

// Update advertisement
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if advertisement belongs to user or user is admin
    const advertisement = await Advertisement.findByPk(id);
    if (!advertisement) {
      return res.status(404).send({
        message: "Объявление не найдено"
      });
    }

    if (advertisement.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).send({
        message: "Доступ запрещен"
      });
    }

    // If material is being updated, check if it exists
    if (updateData.materialId) {
      const material = await Material.findByPk(updateData.materialId);
      if (!material) {
        return res.status(404).send({
          message: "Материал не найден"
        });
      }
    }

    const [updatedRowsCount] = await Advertisement.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).send({
        message: "Объявление не найдено"
      });
    }

    const updatedAdvertisement = await Advertisement.findByPk(id, {
      include: [
        {
          model: Material,
          as: 'material',
          include: [
            {
              model: db.materialCategory,
              as: 'category'
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    res.send({
      message: "Объявление успешно обновлено",
      advertisement: updatedAdvertisement
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления объявления"
    });
  }
};

// Delete advertisement
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if advertisement belongs to user or user is admin
    const advertisement = await Advertisement.findByPk(id);
    if (!advertisement) {
      return res.status(404).send({
        message: "Объявление не найдено"
      });
    }

    if (advertisement.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).send({
        message: "Доступ запрещен"
      });
    }

    // Check if advertisement has active orders
    const activeOrdersCount = await db.order.count({
      where: { 
        advertisementId: id,
        status: { [Op.notIn]: ['cancelled', 'delivered', 'refunded'] }
      }
    });

    if (activeOrdersCount > 0) {
      return res.status(400).send({
        message: "Нельзя удалить объявление с активными заказами"
      });
    }

    const deletedRowsCount = await Advertisement.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).send({
        message: "Объявление не найдено"
      });
    }

    res.send({
      message: "Объявление успешно удалено"
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка удаления объявления"
    });
  }
};

// Get my advertisements
exports.getMyAdvertisements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    const where = { userId: req.userId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Advertisement.findAndCountAll({
      where,
      include: [
        {
          model: Material,
          as: 'material',
          include: [
            {
              model: db.materialCategory,
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

    res.send({
      advertisements: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения моих объявлений"
    });
  }
};

// Mark as sold
exports.markAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findByPk(id);
    if (!advertisement) {
      return res.status(404).send({
        message: "Объявление не найдено"
      });
    }

    if (advertisement.userId !== req.userId) {
      return res.status(403).send({
        message: "Доступ запрещен"
      });
    }

    await advertisement.update({
      status: 'sold'
    });

    res.send({
      message: "Объявление отмечено как проданное",
      advertisement
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления статуса объявления"
    });
  }
};
