const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/user.controller");

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
   * /api/users:
   *   get:
   *     summary: Получить всех пользователей (только админ)
   *     tags: [Users]
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
   *         name: search
   *         schema:
   *           type: string
   *         description: Поиск по имени, email, фамилии
   *     responses:
   *       200:
   *         description: Список пользователей
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 users:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   *       403:
   *         description: Требуются права администратора
   */
  app.get(
    "/api/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.findAll
  );

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Получить пользователя по ID
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID пользователя
   *     responses:
   *       200:
   *         description: Данные пользователя
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       404:
   *         description: Пользователь не найден
   */
  app.get("/api/users/:id", controller.findOne);

  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Обновить данные пользователя
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID пользователя
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               phone:
   *                 type: string
   *     responses:
   *       200:
   *         description: Пользователь успешно обновлен
   *       403:
   *         description: Доступ запрещен
   *       404:
   *         description: Пользователь не найден
   */
  app.put(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isUserOrAdmin],
    controller.update
  );

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Удалить пользователя (только админ)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID пользователя
   *     responses:
   *       200:
   *         description: Пользователь успешно удален
   *       403:
   *         description: Требуются права администратора
   *       404:
   *         description: Пользователь не найден
   */
  app.delete(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delete
  );

  /**
   * @swagger
   * /api/users/profile:
   *   get:
   *     summary: Получить профиль текущего пользователя
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Профиль пользователя
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       404:
   *         description: Пользователь не найден
   */
  app.get(
    "/api/users/profile",
    [authJwt.verifyToken],
    controller.getProfile
  );

  /**
   * @swagger
   * /api/users/profile:
   *   put:
   *     summary: Обновить профиль текущего пользователя
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               phone:
   *                 type: string
   *     responses:
   *       200:
   *         description: Профиль успешно обновлен
   *       404:
   *         description: Пользователь не найден
   */
  app.put(
    "/api/users/profile",
    [authJwt.verifyToken],
    controller.updateProfile
  );

  /**
   * @swagger
   * /api/users/change-password:
   *   post:
   *     summary: Изменить пароль
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *                 description: Текущий пароль
   *               newPassword:
   *                 type: string
   *                 minLength: 6
   *                 description: Новый пароль
   *     responses:
   *       200:
   *         description: Пароль успешно изменен
   *       400:
   *         description: Текущий пароль неверный
   *       404:
   *         description: Пользователь не найден
   */
  app.post(
    "/api/users/change-password",
    [authJwt.verifyToken],
    controller.changePassword
  );
};
