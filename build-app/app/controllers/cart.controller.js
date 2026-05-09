const db = require("../models");
const Cart = db.cart;
const Advertisement = db.advertisement;
const { Op } = db.Sequelize;

// Add item to cart
exports.create = async (req, res) => {
  try {
    const { advertisementId, quantity } = req.body;

    // Check if advertisement exists and is active
    const advertisement = await Advertisement.findByPk(advertisementId);
    if (!advertisement) {
      return res.status(404).send({
        message: "Объявление не найдено"
      });
    }

    if (advertisement.status !== 'active') {
      return res.status(400).send({
        message: "Объявление неактивно"
      });
    }

    if (advertisement.userId === req.userId) {
      return res.status(400).send({
        message: "Нельзя добавить свое объявление в корзину"
      });
    }

    if (parseFloat(quantity) > parseFloat(advertisement.quantity)) {
      return res.status(400).send({
        message: "Недостаточное количество товара"
      });
    }

    // Check if item already in cart
    const existingCartItem = await Cart.findOne({
      where: {
        userId: req.userId,
        advertisementId
      }
    });

    if (existingCartItem) {
      // Update quantity
      const newQuantity = parseFloat(existingCartItem.quantity) + parseFloat(quantity);
      if (newQuantity > parseFloat(advertisement.quantity)) {
        return res.status(400).send({
          message: "Недостаточное количество товара"
        });
      }

      await existingCartItem.update({
        quantity: newQuantity,
        totalPrice: newQuantity * parseFloat(advertisement.price),
        lastModified: new Date()
      });

      return res.send({
        message: "Количество товара в корзине обновлено",
        cartItem: existingCartItem
      });
    }

    // Create new cart item
    const cartItem = await Cart.create({
      userId: req.userId,
      advertisementId,
      quantity,
      price: advertisement.price,
      totalPrice: parseFloat(quantity) * parseFloat(advertisement.price)
    });

    res.status(201).send({
      message: "Товар добавлен в корзину",
      cartItem
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка добавления товара в корзину"
    });
  }
};

// Get cart items
exports.findAll = async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Advertisement,
          as: 'advertisement',
          include: [
            {
              model: db.material,
              as: 'material',
              include: [
                {
                  model: db.materialCategory,
                  as: 'category',
                  attributes: ['id', 'name']
                }
              ]
            },
            {
              model: db.user,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ]
        }
      ],
      order: [['addedAt', 'DESC']]
    });

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);

    res.send({
      cartItems,
      total,
      count: cartItems.length
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения корзины"
    });
  }
};

// Update cart item
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await Cart.findByPk(id, {
      include: [
        {
          model: Advertisement,
          as: 'advertisement'
        }
      ]
    });

    if (!cartItem) {
      return res.status(404).send({
        message: "Элемент корзины не найден"
      });
    }

    if (cartItem.userId !== req.userId) {
      return res.status(403).send({
        message: "Доступ запрещен"
      });
    }

    if (parseFloat(quantity) > parseFloat(cartItem.advertisement.quantity)) {
      return res.status(400).send({
        message: "Недостаточное количество товара"
      });
    }

    await cartItem.update({
      quantity,
      totalPrice: parseFloat(quantity) * parseFloat(cartItem.price),
      lastModified: new Date()
    });

    res.send({
      message: "Элемент корзины обновлен",
      cartItem
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления корзины"
    });
  }
};

// Remove item from cart
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).send({
        message: "Элемент корзины не найден"
      });
    }

    if (cartItem.userId !== req.userId) {
      return res.status(403).send({
        message: "Доступ запрещен"
      });
    }

    await cartItem.destroy();

    res.send({
      message: "Товар удален из корзины"
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка удаления товара из корзины"
    });
  }
};

// Clear cart
exports.clear = async (req, res) => {
  try {
    await Cart.destroy({
      where: { userId: req.userId }
    });

    res.send({
      message: "Корзина очищена"
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка очистки корзины"
    });
  }
};

// Get cart summary
exports.getSummary = async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Advertisement,
          as: 'advertisement',
          attributes: ['id', 'title', 'userId', 'status']
        }
      ]
    });

    // Filter only active advertisements
    const activeItems = cartItems.filter(item => item.advertisement.status === 'active');
    
    const total = activeItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
    const count = activeItems.length;

    res.send({
      total,
      count,
      items: activeItems.length
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения сводки корзины"
    });
  }
};
