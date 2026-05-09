const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/admin.controller");

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
   * /api/admin/stats:
   *   get:
   *     summary: Получить статистику базы данных (только админ)
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Статистика базы данных
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 users:
   *                   type: integer
   *                 materialCategories:
   *                   type: integer
   *                 materials:
   *                   type: integer
   *                 advertisements:
   *                   type: integer
   *                 orders:
   *                   type: integer
   *                 transactions:
   *                   type: integer
   *                 carts:
   *                   type: integer
   *                 reviews:
   *                   type: integer
   *                 totalTransactionVolume:
   *                   type: number
   *                 totalCCoinSupply:
   *                   type: number
   *                 totalOrders:
   *                   type: integer
   *                 completedOrders:
   *                   type: integer
   *                 orderCompletionRate:
   *                   type: string
   *                 activeAdvertisements:
   *                   type: integer
   *                 soldAdvertisements:
   *                   type: integer
   *       403:
   *         description: Требуются права администратора
   */
  app.get(
    "/api/admin/stats",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getDatabaseStats
  );

  /**
   * @swagger
   * /api/admin/table/{tableName}:
   *   get:
   *     summary: Получить все данные из таблицы (только админ)
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tableName
   *         required: true
   *         schema:
   *           type: string
   *           enum: [users, materialCategories, materials, advertisements, orders, transactions, carts, reviews]
   *         description: Имя таблицы
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
   *           default: 50
   *         description: Количество записей на странице
   *     responses:
   *       200:
   *         description: Данные таблицы
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   *       400:
   *         description: Неверное имя таблицы
   *       403:
   *         description: Требуются права администратора
   */
  app.get(
    "/api/admin/table/:tableName",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllTableData
  );

  /**
   * @swagger
   * /api/admin/export/{tableName}:
   *   get:
   *     summary: Экспортировать данные таблицы в PDF (только админ)
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tableName
   *         required: true
   *         schema:
   *           type: string
   *           enum: [users, materialCategories, materials, advertisements, orders, transactions, carts, reviews]
   *         description: Имя таблицы
   *     responses:
   *       200:
   *         description: PDF файл с данными таблицы
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: Неверное имя таблицы
   *       403:
   *         description: Требуются права администратора
   */
  app.get(
    "/api/admin/export/:tableName",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.exportTableToPDF
  );

  /**
   * @swagger
   * /api/admin/logs:
   *   get:
   *     summary: Получить логи приложения (только админ)
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Логи приложения
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   timestamp:
   *                     type: string
   *                   level:
   *                     type: string
   *                     enum: [info, warn, error, debug]
   *                   message:
   *                     type: string
   *                   module:
   *                     type: string
   *       403:
   *         description: Требуются права администратора
   */
  app.get(
    "/api/admin/logs",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getLogs
  );
};
