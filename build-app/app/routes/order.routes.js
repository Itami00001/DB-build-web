const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/order.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  /**
   * @swagger
   * /api/orders:
   *   post:
   *     summary: Создать заказы из корзины
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - cartItemIds
   *               - paymentMethod
   *             properties:
   *               cartItemIds:
   *                 type: array
   *                 items:
   *                   type: integer
   *                 description: ID элементов корзины
   *               paymentMethod:
   *                 type: string
   *                 enum: [c-coin, cash, card]
   *                 description: Способ оплаты
   *               deliveryAddress:
   *                 type: object
   *                 description: Адрес доставки
   *               notes:
   *                 type: string
   *                 description: Примечания к заказу
   *     responses:
   *       201:
   *         description: Заказы успешно созданы
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 orders:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Order'
   *       400:
   *         description: Недостаточно C-coin или неверные данные
   */
  app.post(
    "/api/orders",
    [authJwt.verifyToken],
    controller.create
  );

  /**
   * @swagger
   * /api/orders:
   *   get:
   *     summary: Получить все заказы текущего пользователя
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Номер страницы
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Количество записей на странице
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, confirmed, shipped, delivered, cancelled, refunded]
   *         description: Фильтр по статусу
   *       - in: query
   *         name: paymentStatus
   *         schema:
   *           type: string
   *           enum: [pending, paid, failed, refunded]
   *         description: Фильтр по статусу оплаты
   *     responses:
   *       200:
   *         description: Список заказов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 orders:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Order'
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   */
  app.get(
    "/api/orders",
    [authJwt.verifyToken],
    controller.findAll
  );

  /**
   * @swagger
   * /api/orders/seller:
   *   get:
   *     summary: Получить заказы продавца
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Номер страницы
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Количество записей на странице
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, confirmed, shipped, delivered, cancelled, refunded]
   *         description: Фильтр по статусу
   *     responses:
   *       200:
   *         description: Список заказов продавца
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 orders:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Order'
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   */
  app.get(
    "/api/orders/seller",
    [authJwt.verifyToken],
    controller.getSellerOrders
  );

  /**
   * @swagger
   * /api/orders/{id}:
   *   get:
   *     summary: Получить заказ по ID
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID заказа
   *     responses:
   *       200:
   *         description: Данные заказа
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Заказ не найден
   */
  app.get(
    "/api/orders/:id",
    [authJwt.verifyToken],
    controller.findOne
  );

  /**
   * @swagger
   * /api/orders/{id}/status:
   *   put:
   *     summary: Обновить статус заказа
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID заказа
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, confirmed, shipped, delivered, cancelled, refunded]
   *                 description: Новый статус
   *               trackingNumber:
   *                 type: string
   *                 description: Номер отслеживания
   *               notes:
   *                 type: string
   *                 description: Примечания
   *     responses:
   *       200:
   *         description: Статус заказа обновлен
   *       400:
   *         description: Недопустимый переход статуса
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Заказ не найден
   */
  app.put(
    "/api/orders/:id/status",
    [authJwt.verifyToken],
    controller.updateStatus
  );
};
