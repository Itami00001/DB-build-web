module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  const controller = require("../controllers/public.controller");

  /**
   * @swagger
   * /api/public/stats:
   *   get:
   *     summary: Получить публичную статистику платформы
   *     tags: [Public]
   *     responses:
   *       200:
   *         description: Публичная статистика платформы
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalUsers:
   *                   type: integer
   *                   description: Общее количество пользователей
   *                 totalMaterials:
   *                   type: integer
   *                   description: Общее количество материалов
   *                 totalAdvertisements:
   *                   type: integer
   *                   description: Общее количество объявлений
   *                 totalTransactions:
   *                   type: integer
   *                   description: Общее количество транзакций
   *                 activeAdvertisements:
   *                   type: integer
   *                   description: Количество активных объявлений
   *                 totalCategories:
   *                   type: integer
   *                   description: Количество категорий материалов
   */
  app.get("/api/public/stats", controller.getPublicStats);
};
