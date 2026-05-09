const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/transaction.controller");

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
   * /api/transactions:
   *   post:
   *     summary: Создать транзакцию (перевод C-coin)
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - receiverId
   *               - amount
   *               - type
   *             properties:
   *               receiverId:
   *                 type: integer
   *                 description: ID получателя
   *               amount:
   *                 type: number
   *                 minimum: 0.01
   *                 description: Сумма перевода
   *               type:
   *                 type: string
   *                 enum: [transfer, purchase, reward]
   *                 description: Тип транзакции
   *               description:
   *                 type: string
   *                 description: Описание транзакции
   *     responses:
   *       201:
   *         description: Транзакция успешно выполнена
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 transaction:
   *                   $ref: '#/components/schemas/Transaction'
   *       400:
   *         description: Недостаточно средств или неверные данные
   *       404:
   *         description: Пользователь не найден
   */
  app.post(
    "/api/transactions",
    [authJwt.verifyToken],
    controller.create
  );

  /**
   * @swagger
   * /api/transactions:
   *   get:
   *     summary: Получить все транзакции текущего пользователя
   *     tags: [Transactions]
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
   *         name: type
   *         schema:
   *           type: string
   *           enum: [transfer, purchase, reward, refund]
   *         description: Фильтр по типу транзакции
   *     responses:
   *       200:
   *         description: Список транзакций
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 transactions:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Transaction'
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   */
  app.get(
    "/api/transactions",
    [authJwt.verifyToken],
    controller.findAll
  );

  /**
   * @swagger
   * /api/transactions/{id}:
   *   get:
   *     summary: Получить транзакцию по ID
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID транзакции
   *     responses:
   *       200:
   *         description: Данные транзакции
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Transaction'
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Транзакция не найдена
   */
  app.get(
    "/api/transactions/:id",
    [authJwt.verifyToken],
    controller.findOne
  );

  /**
   * @swagger
   * /api/transactions/reward:
   *   post:
   *     summary: Выдать награду пользователю (только админ)
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - amount
   *             properties:
   *               userId:
   *                 type: integer
   *                 description: ID пользователя для награждения
   *               amount:
   *                 type: number
   *                 minimum: 0.01
   *                 description: Сумма награды
   *               description:
   *                 type: string
   *                 description: Описание награды
   *     responses:
   *       201:
   *         description: Награда успешно выдана
   *       403:
   *         description: Только администратор может выдавать награды
   *       404:
   *         description: Пользователь не найден
   */
  app.post(
    "/api/transactions/reward",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.rewardUser
  );

  /**
   * @swagger
   * /api/transactions/admin:
   *   get:
   *     summary: Получить все транзакции (только админ)
   *     tags: [Transactions]
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
   *         name: type
   *         schema:
   *           type: string
   *           enum: [transfer, purchase, reward, refund]
   *         description: Фильтр по типу транзакции
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, completed, failed, cancelled]
   *         description: Фильтр по статусу
   *     responses:
   *       200:
   *         description: Список всех транзакций
   *       403:
   *         description: Требуются права администратора
   */
  app.get(
    "/api/transactions/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.findAllAdmin
  );
};
