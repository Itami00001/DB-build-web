const db = require("../models");
const User = db.user;
const { Op } = db.Sequelize;
const bcrypt = require("bcryptjs");

// Get all users (admin only)
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const where = search ? {
      [Op.or]: [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.send({
      users: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения списка пользователей"
    });
  }
};

// Get user by ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).send({
        message: "Пользователь не найден"
      });
    }

    res.send(user);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения данных пользователя"
    });
  }
};

// Update user
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.role;
    delete updateData.cCoinBalance;

    const [updatedRowsCount] = await User.update(updateData, {
      where: { id },
      returning: true
    });

    if (updatedRowsCount === 0) {
      return res.status(404).send({
        message: "Пользователь не найден"
      });
    }

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.send({
      message: "Данные пользователя успешно обновлены",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления данных пользователя"
    });
  }
};

// Delete user
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRowsCount = await User.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).send({
        message: "Пользователь не найден"
      });
    }

    res.send({
      message: "Пользователь успешно удален"
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка удаления пользователя"
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    console.log('🔍 getProfile - req.userId:', req.userId);
    
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: db.advertisement,
          as: 'advertisements',
          limit: 5,
          order: [['createdAt', 'DESC']]
        },
        {
          model: db.order,
          as: 'orders',
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).send({
        message: "Пользователь не найден"
      });
    }

    console.log('🔍 getProfile - найденный пользователь:', { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    });
    console.log('🔍 getProfile - отправляемые данные:', JSON.stringify(user, null, 2));

    res.send(user);
  } catch (error) {
    console.error('❌ getProfile - ошибка:', error);
    res.status(500).send({
      message: error.message || "Ошибка получения профиля"
    });
  }
};

// Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.role;
    delete updateData.cCoinBalance;

    const [updatedRowsCount] = await User.update(updateData, {
      where: { id: req.userId },
      returning: true
    });

    if (updatedRowsCount === 0) {
      return res.status(404).send({
        message: "Пользователь не найден"
      });
    }

    const updatedUser = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });

    res.send({
      message: "Профиль успешно обновлен",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления профиля"
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({
        message: "Пользователь не найден"
      });
    }

    // Verify current password
    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
    if (!passwordIsValid) {
      return res.status(400).send({
        message: "Текущий пароль неверный"
      });
    }

    // Update password
    await user.update({
      password: bcrypt.hashSync(newPassword, 8)
    });

    res.send({
      message: "Пароль успешно изменен"
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка изменения пароля"
    });
  }
};
