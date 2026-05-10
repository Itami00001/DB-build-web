const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/cart.controller");

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
   * /api/cart:
   *   post:
   *     summary: Добавить товар в корзину
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - advertisementId
   *               - quantity
   *             properties:
   *               advertisementId:
   *                 type: integer
   *                 description: ID объявления
   *               quantity:
   *                 type: number
   *                 minimum: 0.01
   *                 description: Количество товара
   *     responses:
   *       201:
   *         description: Товар добавлен в корзину
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 cartItem:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     userId:
   *                       type: integer
   *                     advertisementId:
   *                       type: integer
   *                     quantity:
   *                       type: number
   *                     price:
   *                       type: number
   *                     totalPrice:
   *                       type: number
   *       400:
   *         description: Объявление неактивно или недостаточное количество
   *       404:
   *         description: Объявление не найдено
   */
  app.post(
    "/api/cart",
    [authJwt.verifyToken],
    controller.create
  );

  /**
   * @swagger
   * /api/cart:
   *   get:
   *     summary: Получить товары в корзине
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Содержимое корзины
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 cartItems:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       quantity:
   *                         type: number
   *                       price:
   *                         type: number
   *                       totalPrice:
   *                         type: number
   *                       advertisement:
   *                         $ref: '#/components/schemas/Advertisement'
   *                 total:
   *                   type: number
   *                 count:
   *                   type: integer
   */
  app.get(
    "/api/cart",
    [authJwt.verifyToken],
    controller.findAll
  );

  /**
   * @swagger
   * /api/cart/{id}:
   *   put:
   *     summary: Обновить количество товара в корзине
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID элемента корзины
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - quantity
   *             properties:
   *               quantity:
   *                 type: number
   *                 minimum: 0.01
   *                 description: Новое количество
   *     responses:
   *       200:
   *         description: Элемент корзины обновлен
   *       400:
   *         description: Недостаточное количество товара
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Элемент корзины не найден
   */
  app.put(
    "/api/cart/:id",
    [authJwt.verifyToken],
    controller.update
  );

  /**
   * @swagger
   * /api/cart/{id}:
   *   delete:
   *     summary: Удалить товар из корзины
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID элемента корзины
   *     responses:
   *       200:
   *         description: Товар удален из корзины
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Элемент корзины не найден
   */
  app.delete(
    "/api/cart/:id",
    [authJwt.verifyToken],
    controller.delete
  );

  /**
   * @swagger
   * /api/cart/clear:
   *   delete:
   *     summary: Очистить корзину
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Корзина очищена
   */
  app.delete(
    "/api/cart/clear",
    [authJwt.verifyToken],
    controller.clear
  );

  /**
   * @swagger
   * /api/cart/summary:
   *   get:
   *     summary: Получить сводку по корзине
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Сводка по корзине
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 total:
   *                   type: number
   *                   description: Общая сумма
   *                 count:
   *                   type: integer
   *                   description: Количество товаров
   *                 items:
   *                   type: integer
   *                   description: Количество активных товаров
   */
  app.get(
    "/api/cart/summary",
    [authJwt.verifyToken],
    controller.getSummary
  );

  /**
   * @swagger
   * /api/cart/purchase:
   *   post:
   *     summary: Купить товар из корзины
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - cartItemId
   *               - advertisementId
   *             properties:
   *               cartItemId:
   *                 type: integer
   *                 description: ID элемента корзины
   *               advertisementId:
   *                 type: integer
   *                 description: ID объявления
   *     responses:
   *       200:
   *         description: Товар успешно куплен
   *       400:
   *         description: Недостаточно средств или объявление неактивно
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Элемент корзины не найден
   */
  app.post(
    "/api/cart/purchase",
    [authJwt.verifyToken],
    controller.purchase
  );
};
