const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/material.controller");

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
   * /api/materials:
   *   post:
   *     summary: Создать материал (только админ)
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - categoryId
   *               - price
   *             properties:
   *               name:
   *                 type: string
   *                 description: Название материала
   *               description:
   *                 type: string
   *                 description: Описание материала
   *               categoryId:
   *                 type: integer
   *                 description: ID категории
   *               price:
   *                 type: number
   *                 minimum: 0
   *                 description: Цена
   *               unit:
   *                 type: string
   *                 default: шт
   *                 description: Единица измерения
   *               inStock:
   *                 type: number
   *                 minimum: 0
   *                 default: 0
   *                 description: Количество на складе
   *               minOrder:
   *                 type: number
   *                 minimum: 0.01
   *                 default: 1
   *                 description: Минимальный заказ
   *               image:
   *                 type: string
   *                 format: uri
   *                 description: URL изображения
   *               specifications:
   *                 type: object
   *                 description: Спецификации материала
   *     responses:
   *       201:
   *         description: Материал успешно создан
   *       400:
   *         description: Ошибка валидации
   *       403:
   *         description: Требуются права администратора
   *       404:
   *         description: Категория не найдена
   */
  app.post(
    "/api/materials",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.create
  );

  /**
   * @swagger
   * /api/materials:
   *   get:
   *     summary: Получить все материалы
   *     tags: [Materials]
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
   *         description: Поиск по названию или описанию
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
   *         name: inStock
   *         schema:
   *           type: boolean
   *         description: Только в наличии
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, name, price, rating, reviewCount]
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
   *         description: Список материалов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 materials:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Material'
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   */
  app.get("/api/materials", controller.findAll);

  /**
   * @swagger
   * /api/materials/featured:
   *   get:
   *     summary: Получить избранные материалы
   *     tags: [Materials]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Количество записей
   *     responses:
   *       200:
   *         description: Список избранных материалов
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Material'
   */
  app.get("/api/materials/featured", controller.getFeatured);

  /**
   * @swagger
   * /api/materials/category/{categoryId}:
   *   get:
   *     summary: Получить материалы по категории
   *     tags: [Materials]
   *     parameters:
   *       - in: path
   *         name: categoryId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID категории
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
   *     responses:
   *       200:
   *         description: Список материалов категории
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 materials:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Material'
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   */
  app.get("/api/materials/category/:categoryId", controller.getByCategory);

  /**
   * @swagger
   * /api/materials/{id}:
   *   get:
   *     summary: Получить материал по ID
   *     tags: [Materials]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID материала
   *     responses:
   *       200:
   *         description: Данные материала
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Material'
   *       404:
   *         description: Материал не найден
   */
  app.get("/api/materials/:id", controller.findOne);

  /**
   * @swagger
   * /api/materials/{id}:
   *   put:
   *     summary: Обновить материал (только админ)
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID материала
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               categoryId:
   *                 type: integer
   *               price:
   *                 type: number
   *               unit:
   *                 type: string
   *               inStock:
   *                 type: number
   *               minOrder:
   *                 type: number
   *               image:
   *                 type: string
   *               specifications:
   *                 type: object
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Материал успешно обновлен
   *       403:
   *         description: Требуются права администратора
   *       404:
   *         description: Материал или категория не найдены
   */
  app.put(
    "/api/materials/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.update
  );

  /**
   * @swagger
   * /api/materials/{id}:
   *   delete:
   *     summary: Удалить материал (только админ)
   *     tags: [Materials]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID материала
   *     responses:
   *       200:
   *         description: Материал успешно удален
   *       400:
   *         description: Нельзя удалить материал с объявлениями
   *       403:
   *         description: Требуются права администратора
   *       404:
   *         описание: Материал не найден
   */
  app.delete(
    "/api/materials/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delete
  );
};
