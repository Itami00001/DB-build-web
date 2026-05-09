const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, birthDate } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).send({
        message: "Пользователь с таким именем или email уже существует!"
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
      firstName,
      lastName,
      phone,
      birthDate,
      role: 'user'
    });

    res.status(201).send({
      message: "Пользователь успешно зарегистрирован!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        cCoinBalance: user.cCoinBalance
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка при регистрации пользователя"
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ username }, { email: username }]
      }
    });

    if (!user) {
      return res.status(404).send({
        message: "Пользователь не найден"
      });
    }

    // Check password
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Неверный пароль"
      });
    }

    if (!user.isActive) {
      return res.status(403).send({
        message: "Аккаунт деактивирован"
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.secret,
      { expiresIn: config.jwtExpiration }
    );

    res.status(200).send({
      message: "Вход выполнен успешно!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        cCoinBalance: user.cCoinBalance
      },
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка при входе в систему"
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(403).send({
        message: "Refresh токен не предоставлен"
      });
    }

    jwt.verify(refreshToken, config.refreshSecret, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Невалидный refresh токен"
        });
      }

      const token = jwt.sign(
        { id: decoded.id, username: decoded.username, role: decoded.role },
        config.secret,
        { expiresIn: config.jwtExpiration }
      );

      res.status(200).send({
        accessToken: token
      });
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления токена"
    });
  }
};
