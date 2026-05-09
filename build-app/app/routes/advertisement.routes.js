const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/advertisement.controller");

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
   * /api/advertisements:
   *   post:
   *     summary: Создать объявление
   *     tags: [Advertisements]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - materialId
   *               - price
   *               - quantity
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 5
   *                 description: Заголовок объявления
   *               description:
   *                 type: string
   *                 description: Описание объявления
   *               materialId:
   *                 type: integer
   *                 description: ID материала
   *               price:
   *                 type: number
   *                 minimum: 0
   *                 description: Цена в C-coin
   *               quantity:
   *                 type: number
   *                 minimum: 0.01
   *                 description: Количество материала
   *               location:
   *                 type: string
   *                 description: Местоположение
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: URL изображений
   *               contactInfo:
   *                 type: object
   *                 description: Контактная информация
   *     responses:
   *       201:
   *         description: Объявление успешно создано
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 advertisement:
   *                   $ref: '#/components/schemas/Advertisement'
   *       400:
   *         description: Недостаточно C-coin или неверные данные
   *       404:
   *         description: Материал не найден
   */
  app.post(
    "/api/advertisements",
    [authJwt.verifyToken],
    controller.create
  );

  /**
   * @swagger
   * /api/advertisements:
   *   get:
   *     summary: Получить все объявления
   *     tags: [Advertisements]
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
   *         name: search
   *         schema:
   *           type: string
   *         description: Поиск по заголовку или описанию
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: integer
   *         description: ID категории
   *       - in: query
   *         name: minPrice
   *         schema:
   *           type: number
   *         description: Минимальная цена
   *       - in: query
   *         name: maxPrice
   *         schema:
   *           type: number
   *         description: Максимальная цена
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, sold, inactive, reserved]
   *           default: active
   *         description: Статус объявления
   *       - in: query
   *         name: userId
   *         schema:
   *           type: integer
   *         description: ID пользователя
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, price, views, title]
   *           default: createdAt
   *         description: Поле сортировки
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [ASC, DESC]
   *           default: DESC
   *         description: Порядок сортировки
   *     responses:
   *       200:
   *         description: Список объявлений
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 advertisements:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Advertisement'
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   */
  app.get("/api/advertisements", controller.findAll);

  /**
   * @swagger
   * /api/advertisements/my:
   *   get:
   *     summary: Получить мои объявления
   *     tags: [Advertisements]
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
   *           enum: [active, sold, inactive, reserved]
   *         description: Фильтр по статусу
   *     responses:
   *       200:
   *         description: Список моих объявлений
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 advertisements:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Advertisement'
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   */
  app.get(
    "/api/advertisements/my",
    [authJwt.verifyToken],
    controller.getMyAdvertisements
  );

  /**
   * @swagger
   * /api/advertisements/{id}:
   *   get:
   *     summary: Получить объявление по ID
   *     tags: [Advertisements]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID объявления
   *     responses:
   *       200:
   *         description: Данные объявления
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Advertisement'
   *       404:
   *         description: Объявление не найдено
   */
  app.get("/api/advertisements/:id", controller.findOne);

  /**
   * @swagger
   * /api/advertisements/{id}:
   *   put:
   *     summary: Обновить объявление
   *     tags: [Advertisements]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID объявления
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               price:
   *                 type: number
   *               quantity:
   *                 type: number
   *               status:
   *                 type: string
   *                 enum: [active, sold, inactive, reserved]
   *               location:
   *                 type: string
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *               contactInfo:
   *                 type: object
   *     responses:
   *       200:
   *         description: Объявление успешно обновлено
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Объявление или материал не найдены
   */
  app.put(
    "/api/advertisements/:id",
    [authJwt.verifyToken],
    controller.update
  );

  /**
   * @swagger
   * /api/advertisements/{id}:
   *   delete:
   *     summary: Удалить объявление
   *     tags: [Advertisements]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID объявления
   *     responses:
   *       200:
   *         description: Объявление успешно удалено
   *       400:
   *         description: Нельзя удалить объявление с активными заказами
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Объявление не найдено
   */
  app.delete(
    "/api/advertisements/:id",
    [authJwt.verifyToken],
    controller.delete
  );

  /**
   * @swagger
   * /api/advertisements/{id}/mark-sold:
   *   put:
   *     summary: Отметить объявление как проданное
   *     tags: [Advertisements]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID объявления
   *     responses:
   *       200:
   *         description: Объявление отмечено как проданное
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Объявление не найдено
   */
  app.put(
    "/api/advertisements/:id/mark-sold",
    [authJwt.verifyToken],
    controller.markAsSold
  );
};
