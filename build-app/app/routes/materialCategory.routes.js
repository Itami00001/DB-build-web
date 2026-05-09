const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/materialCategory.controller");

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
   * /api/material-categories:
   *   post:
   *     summary: Создать категорию материалов (только админ)
   *     tags: [Material Categories]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MaterialCategory'
   *     responses:
   *       201:
   *         description: Категория успешно создана
   *       400:
   *         description: Категория уже существует
   *       403:
   *         description: Требуются права администратора
   */
  app.post(
    "/api/material-categories",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.create
  );

  /**
   * @swagger
   * /api/material-categories:
   *   get:
   *     summary: Получить все категории материалов
   *     tags: [Material Categories]
   *     parameters:
   *       - in: query
   *         name: includeChildren
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Включить подкатегории
   *       - in: query
   *         name: parentOnly
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Только родительские категории
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Поиск по названию или описанию
   *     responses:
   *       200:
   *         description: Список категорий
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/MaterialCategory'
   */
  app.get("/api/material-categories", controller.findAll);

  /**
   * @swagger
   * /api/material-categories/tree:
   *   get:
   *     summary: Получить дерево категорий
   *     tags: [Material Categories]
   *     responses:
   *       200:
   *         description: Дерево категорий
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                   name:
   *                     type: string
   *                   description:
   *                     type: string
   *                   materialCount:
   *                     type: integer
   *                   children:
   *                     type: array
   *                     items:
   *                       type: object
   */
  app.get("/api/material-categories/tree", controller.getTree);

  /**
   * @swagger
   * /api/material-categories/{id}:
   *   get:
   *     summary: Получить категорию по ID
   *     tags: [Material Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID категории
   *     responses:
   *       200:
   *         description: Данные категории
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MaterialCategory'
   *       404:
   *         description: Категория не найдена
   */
  app.get("/api/material-categories/:id", controller.findOne);

  /**
   * @swagger
   * /api/material-categories/{id}:
   *   put:
   *     summary: Обновить категорию (только админ)
   *     tags: [Material Categories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID категории
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
   *               parentCategoryId:
   *                 type: integer
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Категория успешно обновлена
   *       403:
   *         description: Требуются права администратора
   *       404:
   *         description: Категория не найдена
   */
  app.put(
    "/api/material-categories/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.update
  );

  /**
   * @swagger
   * /api/material-categories/{id}:
   *   delete:
   *     summary: Удалить категорию (только админ)
   *     tags: [Material Categories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID категории
   *     responses:
   *       200:
   *         description: Категория успешно удалена
   *       400:
   *         description: Нельзя удалить категорию с подкатегориями или материалами
   *       403:
   *         description: Требуются права администратора
   *       404:
   *         description: Категория не найдена
   */
  app.delete(
    "/api/material-categories/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delete
  );
};
