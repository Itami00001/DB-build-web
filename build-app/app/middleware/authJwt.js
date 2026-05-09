const jwt = require("jsonwebtoken");
const db = require("../models");
const config = require("../config/auth.config");

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).send({
      message: "Токен не предоставлен!"
    });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Невалидный токен!"
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await db.user.findByPk(req.userId);
    if (user && user.role === 'admin') {
      next();
      return;
    }
    res.status(403).send({
      message: "Требуются права администратора!"
    });
  } catch (error) {
    res.status(500).send({
      message: "Ошибка проверки прав администратора"
    });
  }
};

const isUserOrAdmin = async (req, res, next) => {
  try {
    const user = await db.user.findByPk(req.userId);
    if (user && (user.role === 'admin' || user.id === parseInt(req.params.id))) {
      next();
      return;
    }
    res.status(403).send({
      message: "Доступ запрещен!"
    });
  } catch (error) {
    res.status(500).send({
      message: "Ошибка проверки прав доступа"
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isUserOrAdmin
};
