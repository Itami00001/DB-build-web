const db = require("../models");
const Order = db.order;
const Advertisement = db.advertisement;
const User = db.user;
const { Op } = db.Sequelize;

// Create order from cart
exports.create = async (req, res) => {
  try {
    const { cartItemIds, deliveryAddress, paymentMethod, notes } = req.body;

    // Get cart items
    const cartItems = await db.cart.findAll({
      where: {
        id: { [Op.in]: cartItemIds },
        userId: req.userId
      },
      include: [
        {
          model: Advertisement,
          as: 'advertisement',
          include: [
            {
              model: db.material,
              as: 'material'
            }
          ]
        }
      ]
    });

    if (cartItems.length === 0) {
      return res.status(400).send({
        message: "Корзина пуста или элементы не найдены"
      });
    }

    // Check user balance for C-coin payment
    const user = await User.findByPk(req.userId);
    const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);

    if (paymentMethod === 'c-coin' && parseFloat(user.cCoinBalance) < totalAmount) {
      return res.status(400).send({
        message: "Недостаточно C-coin на балансе"
      });
    }

    const orders = await db.sequelize.transaction(async (t) => {
      const createdOrders = [];

      for (const cartItem of cartItems) {
        const advertisement = cartItem.advertisement;

        // Check if still available
        if (parseFloat(cartItem.quantity) > parseFloat(advertisement.quantity)) {
          throw new Error(`Недостаточное количество для товара: ${advertisement.title}`);
        }

        // Create order
        const order = await Order.create({
          userId: req.userId,
          advertisementId: advertisement.id,
          quantity: cartItem.quantity,
          totalPrice: cartItem.totalPrice,
          paymentMethod,
          deliveryAddress,
          notes,
          status: 'pending',
          paymentStatus: paymentMethod === 'c-coin' ? 'pending' : 'pending'
        }, { transaction: t });

        // Update advertisement quantity
        await advertisement.update({
          quantity: parseFloat(advertisement.quantity) - parseFloat(cartItem.quantity)
        }, { transaction: t });

        // Process C-coin payment
        if (paymentMethod === 'c-coin') {
          await db.transaction.create({
            senderId: req.userId,
            receiverId: advertisement.userId,
            amount: parseFloat(cartItem.totalPrice),
            type: 'purchase',
            description: `Оплата заказа #${order.id}`,
            balanceBefore: parseFloat(user.cCoinBalance),
            balanceAfter: parseFloat(user.cCoinBalance) - parseFloat(cartItem.totalPrice),
            status: 'completed',
            completedAt: new Date(),
            referenceId: order.id,
            referenceType: 'order'
          }, { transaction: t });

          // Update seller balance
          const seller = await User.findByPk(advertisement.userId);
          await seller.update({
            cCoinBalance: parseFloat(seller.cCoinBalance) + parseFloat(cartItem.totalPrice)
          }, { transaction: t });

          // Update buyer balance
          await user.update({
            cCoinBalance: parseFloat(user.cCoinBalance) - parseFloat(cartItem.totalPrice)
          }, { transaction: t });

          // Update order payment status
          await order.update({
            paymentStatus: 'paid'
          }, { transaction: t });
        }

        createdOrders.push(order);
      }

      // Remove cart items
      await db.cart.destroy({
        where: {
          id: { [Op.in]: cartItemIds }
        }
      }, { transaction: t });

      return createdOrders;
    });

    res.status(201).send({
      message: "Заказы успешно созданы",
      orders
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка создания заказа"
    });
  }
};

// Get all orders for current user
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;

    const where = { userId: req.userId };
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const { count, rows } = await Order.findAndCountAll({
      where,
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
              attributes: ['id', 'username', 'firstName', 'lastName', 'phone']
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.send({
      orders: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения заказов"
    });
  }
};

// Get order by ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
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
                  as: 'category'
                }
              ]
            },
            {
              model: db.user,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'phone', 'email']
        }
      ]
    });

    if (!order) {
      return res.status(404).send({
        message: "Заказ не найден"
      });
    }

    // Check if user is buyer or seller or admin
    if (order.userId !== req.userId && 
        order.advertisement.userId !== req.userId && 
        req.userRole !== 'admin') {
      return res.status(403).send({
        message: "Доступ запрещен"
      });
    }

    res.send(order);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения заказа"
    });
  }
};

// Update order status (admin or seller)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Advertisement,
          as: 'advertisement'
        }
      ]
    });

    if (!order) {
      return res.status(404).send({
        message: "Заказ не найден"
      });
    }

    // Check permissions
    const isSeller = order.advertisement.userId === req.userId;
    const isBuyer = order.userId === req.userId;
    const isAdmin = req.userRole === 'admin';

    // Define allowed status transitions
    const allowedTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': ['refunded'],
      'cancelled': [],
      'refunded': []
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      return res.status(400).send({
        message: "Недопустимый переход статуса"
      });
    }

    // Check who can update which status
    if ((status === 'confirmed' || status === 'shipped') && !isSeller && !isAdmin) {
      return res.status(403).send({
        message: "Только продавец может подтвердить или отправить заказ"
      });
    }

    if ((status === 'delivered') && !isBuyer && !isAdmin) {
      return res.status(403).send({
        message: "Только покупатель может подтвердить доставку"
      });
    }

    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = notes || 'Отменено пользователем';

      // Refund C-coin if payment was made
      if (order.paymentStatus === 'paid' && order.paymentMethod === 'c-coin') {
        await db.sequelize.transaction(async (t) => {
          // Refund to buyer
          const buyer = await User.findByPk(order.userId);
          await buyer.update({
            cCoinBalance: parseFloat(buyer.cCoinBalance) + parseFloat(order.totalPrice)
          }, { transaction: t });

          // Deduct from seller
          const seller = await User.findByPk(order.advertisement.userId);
          await seller.update({
            cCoinBalance: parseFloat(seller.cCoinBalance) - parseFloat(order.totalPrice)
          }, { transaction: t });

          // Create refund transaction
          await db.transaction.create({
            senderId: order.advertisement.userId,
            receiverId: order.userId,
            amount: parseFloat(order.totalPrice),
            type: 'refund',
            description: `Возврат за заказ #${order.id}`,
            status: 'completed',
            completedAt: new Date(),
            referenceId: order.id,
            referenceType: 'order'
          }, { transaction: t });

          // Update order payment status
          await order.update({
            paymentStatus: 'refunded'
          }, { transaction: t });

          // Return quantity to advertisement
          await order.advertisement.update({
            quantity: parseFloat(order.advertisement.quantity) + parseFloat(order.quantity)
          }, { transaction: t });
        });
      }
    }

    if (status === 'delivered') {
      updateData.deliveryDate = new Date();
    }

    await order.update(updateData);

    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Advertisement,
          as: 'advertisement',
          include: [
            {
              model: db.user,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ]
        }
      ]
    });

    res.send({
      message: "Статус заказа обновлен",
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления статуса заказа"
    });
  }
};

// Get seller orders
exports.getSellerOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: Advertisement,
          as: 'advertisement',
          where: { userId: req.userId },
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
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'phone', 'email']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.send({
      orders: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения заказов продавца"
    });
  }
};
