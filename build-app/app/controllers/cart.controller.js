const db = require("../models");
const Cart = db.cart;
const Advertisement = db.advertisement;
const { Op } = db.Sequelize;

// Add item to cart
exports.create = async (req, res) => {
  try {
    const { advertisementId } = req.body;
    let quantity = req.body.quantity ?? 1;
    
    // Validate and sanitize quantity
    quantity = parseFloat(quantity);
    if (isNaN(quantity) || quantity < 0.01) {
      quantity = 1;
    }

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
      const currentQuantity = parseFloat(existingCartItem.quantity) || 0;
      const newQuantity = currentQuantity + quantity;
      
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
      quantity: parseFloat(quantity),
      price: parseFloat(advertisement.price),
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
          as: 'advertisement'
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
    console.error('Ошибка получения корзины:', error);
    res.status(500).send({
      message: error.message || "Ошибка получения корзины"
    });
  }
};

// Update cart item
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    let { quantity } = req.body;
    
    // Validate and sanitize quantity
    quantity = parseFloat(quantity);
    if (isNaN(quantity) || quantity < 0.01) {
      return res.status(400).send({
        message: "Некорректное количество. Минимальное значение: 0.01"
      });
    }

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
    console.log('🗑️ Удаление элемента корзины ID:', id, 'для пользователя:', req.userId);

    const cartItem = await Cart.findByPk(id);
    console.log('🗑️ Найденный элемент корзины:', cartItem);
    
    if (!cartItem) {
      console.log('❌ Элемент корзины не найден');
      return res.status(404).send({
        message: "Элемент корзины не найден"
      });
    }

    console.log('🗑️ userId элемента:', cartItem.userId, 'req.userId:', req.userId);
    
    if (cartItem.userId !== req.userId) {
      console.log('❌ Доступ запрещен - не ваш элемент');
      return res.status(403).send({
        message: "Доступ запрещен"
      });
    }

    await cartItem.destroy();
    console.log('✅ Элемент корзины удален');

    res.send({
      message: "Товар удален из корзины"
    });
  } catch (error) {
    console.error('❌ Ошибка удаления из корзины:', error);
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

// Purchase item from cart
exports.purchase = async (req, res) => {
  try {
    const { cartItemId, advertisementId } = req.body;

    // Get cart item
    const cartItem = await Cart.findByPk(cartItemId, {
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

    if (cartItem.advertisement.status !== 'active') {
      return res.status(400).send({
        message: "Объявление неактивно"
      });
    }

    // Get user and check balance
    const User = db.user;
    const buyer = await User.findByPk(req.userId);
    const seller = await User.findByPk(cartItem.advertisement.userId);

    if (!buyer || !seller) {
      return res.status(404).send({
        message: "Пользователь не найден"
      });
    }

    const buyerBalance = parseFloat(buyer.cCoinBalance || 0);
    const sellerBalance = parseFloat(seller.cCoinBalance || 0);
    const price = parseFloat(cartItem.totalPrice);

    if (buyerBalance < price) {
      return res.status(400).send({
        message: "Недостаточно C-coin на балансе"
      });
    }

    // Update balances
    await buyer.update({ cCoinBalance: buyerBalance - price });
    await seller.update({ cCoinBalance: sellerBalance + price });

    // Update advertisement status to inactive
    await cartItem.advertisement.update({ status: 'inactive' });

    // Remove from cart
    await cartItem.destroy();

    res.send({
      message: "Товар успешно куплен",
      advertisement: cartItem.advertisement
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка покупки"
    });
  }
};
