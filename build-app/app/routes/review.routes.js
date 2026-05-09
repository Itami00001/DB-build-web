const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/review.controller");

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
   * /api/reviews:
   *   post:
   *     summary: Создать отзыв
   *     tags: [Reviews]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - rating
   *               - comment
   *             properties:
   *               materialId:
   *                 type: integer
   *                 description: ID материала
   *               advertisementId:
   *                 type: integer
   *                 description: ID объявления
   *               targetUserId:
   *                 type: integer
   *                 description: ID пользователя
   *               rating:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 5
   *                 description: Оценка (1-5)
   *               title:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 200
   *                 description: Заголовок отзыва
   *               comment:
   *                 type: string
   *                 minLength: 10
   *                 maxLength: 2000
   *                 description: Текст отзыва
   *               pros:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Плюсы
   *               cons:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Минусы
   *     responses:
   *       201:
   *         description: Отзыв успешно добавлен
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 review:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     rating:
   *                       type: integer
   *                     comment:
   *                       type: string
   *                     createdAt:
   *                       type: string
   *       400:
   *         description: Отзыв уже существует или неверные данные
   *       404:
   *         description: Объект отзыва не найден
   */
  app.post(
    "/api/reviews",
    [authJwt.verifyToken],
    controller.create
  );

  /**
   * @swagger
   * /api/reviews:
   *   get:
   *     summary: Получить все отзывы
   *     tags: [Reviews]
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
   *         name: materialId
   *         schema:
   *           type: integer
   *         description: ID материала
   *       - in: query
   *         name: advertisementId
   *         schema:
   *           type: integer
   *         description: ID объявления
   *       - in: query
   *         name: targetUserId
   *         schema:
   *           type: integer
   *         description: ID пользователя
   *       - in: query
   *         name: rating
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 5
   *         description: Фильтр по оценке
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, approved, rejected, hidden]
   *         description: Фильтр по статусу
   *     responses:
   *       200:
   *         description: Список отзывов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 reviews:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       rating:
   *                         type: integer
   *                       comment:
   *                         type: string
   *                       user:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                           username:
   *                             type: string
   *                           firstName:
   *                             type: string
   *                           lastName:
   *                             type: string
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   */
  app.get("/api/reviews", controller.findAll);

  /**
   * @swagger
   * /api/reviews/{id}:
   *   get:
   *     summary: Получить отзыв по ID
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID отзыва
   *     responses:
   *       200:
   *         description: Данные отзыва
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 rating:
   *                   type: integer
   *                 comment:
   *                   type: string
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     username:
   *                       type: string
   *                     firstName:
   *                       type: string
   *                     lastName:
   *                       type: string
   *       404:
   *         description: Отзыв не найден
   */
  app.get("/api/reviews/:id", controller.findOne);

  /**
   * @swagger
   * /api/reviews/{id}:
   *   put:
   *     summary: Обновить отзыв
   *     tags: [Reviews]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID отзыва
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               rating:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 5
   *               title:
   *                 type: string
   *               comment:
   *                 type: string
   *               pros:
   *                 type: array
   *                 items:
   *                   type: string
   *               cons:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Отзыв успешно обновлен
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Отзыв не найден
   */
  app.put(
    "/api/reviews/:id",
    [authJwt.verifyToken],
    controller.update
  );

  /**
   * @swagger
   * /api/reviews/{id}:
   *   delete:
   *     summary: Удалить отзыв
   *     tags: [Reviews]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID отзыва
   *     responses:
   *       200:
   *         description: Отзыв успешно удален
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Отзыв не найден
   */
  app.delete(
    "/api/reviews/:id",
    [authJwt.verifyToken],
    controller.delete
  );

  /**
   * @swagger
   * /api/reviews/{id}/helpful:
   *   post:
   *     summary: Отметить отзыв как полезный
   *     tags: [Reviews]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID отзыва
   *     responses:
   *       200:
   *         description: Отзыв отмечен как полезный
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 helpfulCount:
   *                   type: integer
   *       404:
   *         description: Отзыв не найден
   */
  app.post(
    "/api/reviews/:id/helpful",
    [authJwt.verifyToken],
    controller.markHelpful
  );

  /**
   * @swagger
   * /api/reviews/{id}/status:
   *   put:
   *     summary: Обновить статус отзыва (только админ)
   *     tags: [Reviews]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID отзыва
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
   *                 enum: [pending, approved, rejected, hidden]
   *                 description: Новый статус
   *               response:
   *                 type: string
   *                 description: Ответ на отзыв
   *     responses:
   *       200:
   *         description: Статус отзыва обновлен
   *       403:
   *         description: Только администратор может изменять статус
   *       404:
   *         description: Отзыв не найден
   */
  app.put(
    "/api/reviews/:id/status",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateStatus
  );
};
