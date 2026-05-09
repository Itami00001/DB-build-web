const { authJwt } = require("../middleware/authJwt");
const controller = require("../controllers/auth.controller");

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
   * /api/auth/signup:
   *   post:
   *     summary: Регистрация нового пользователя
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - password
   *               - firstName
   *               - lastName
   *               - birthDate
   *             properties:
   *               username:
   *                 type: string
   *                 description: Имя пользователя
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email (только Gmail)
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 description: Пароль
   *               firstName:
   *                 type: string
   *                 description: Имя
   *               lastName:
   *                 type: string
   *                 description: Фамилия
   *               phone:
   *                 type: string
   *                 description: Номер телефона
   *               birthDate:
   *                 type: string
   *                 format: date
   *                 description: Дата рождения
   *     responses:
   *       201:
   *         description: Пользователь успешно зарегистрирован
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Ошибка валидации или пользователь уже существует
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post("/api/auth/signup", controller.signup);

  /**
   * @swagger
   * /api/auth/signin:
   *   post:
   *     summary: Вход в систему
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 description: Имя пользователя или email
   *               password:
   *                 type: string
   *                 description: Пароль
   *     responses:
   *       200:
   *         description: Вход выполнен успешно
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *                 accessToken:
   *                   type: string
   *                   description: JWT токен
   *       401:
   *         description: Неверный пароль
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Пользователь не найден
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post("/api/auth/signin", controller.signin);

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     summary: Обновление JWT токена
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 description: Refresh токен
   *     responses:
   *       200:
   *         description: Токен успешно обновлен
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                   description: Новый JWT токен
   *       401:
   *         description: Невалидный refresh токен
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post("/api/auth/refresh", controller.refreshToken);
};
