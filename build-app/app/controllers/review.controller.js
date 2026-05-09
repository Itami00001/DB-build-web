const db = require("../models");
const Review = db.review;
const Material = db.material;
const Advertisement = db.advertisement;
const { Op } = db.Sequelize;

// Create review
exports.create = async (req, res) => {
  try {
    const { materialId, advertisementId, targetUserId, rating, title, comment, pros, cons } = req.body;

    // Validate that at least one target is specified
    if (!materialId && !advertisementId && !targetUserId) {
      return res.status(400).send({
        message: "Необходимо указать хотя бы один объект для отзыва (материал, объявление или пользователь)"
      });
    }

    // Check if user already reviewed this item
    const where = { userId: req.userId };
    if (materialId) where.materialId = materialId;
    if (advertisementId) where.advertisementId = advertisementId;
    if (targetUserId) where.targetUserId = targetUserId;

    const existingReview = await Review.findOne({ where });
    if (existingReview) {
      return res.status(400).send({
        message: "Вы уже оставляли отзыв на этот объект"
      });
    }

    // Validate target existence
    if (materialId) {
      const material = await Material.findByPk(materialId);
      if (!material) {
        return res.status(404).send({
          message: "Материал не найден"
        });
      }
    }

    if (advertisementId) {
      const advertisement = await Advertisement.findByPk(advertisementId);
      if (!advertisement) {
        return res.status(404).send({
          message: "Объявление не найдено"
        });
      }
    }

    if (targetUserId) {
      const targetUser = await db.user.findByPk(targetUserId);
      if (!targetUser) {
        return res.status(404).send({
          message: "Пользователь не найден"
        });
      }

      if (targetUserId === req.userId) {
        return res.status(400).send({
          message: "Нельзя оставлять отзыв на самого себя"
        });
      }
    }

    const review = await Review.create({
      userId: req.userId,
      materialId,
      advertisementId,
      targetUserId,
      rating,
      title,
      comment,
      pros: pros || [],
      cons: cons || []
    });

    // Update material rating if material review
    if (materialId) {
      await updateMaterialRating(materialId);
    }

    res.status(201).send({
      message: "Отзыв успешно добавлен",
      review
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка создания отзыва"
    });
  }
};

// Get all reviews
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const materialId = req.query.materialId;
    const advertisementId = req.query.advertisementId;
    const targetUserId = req.query.targetUserId;
    const rating = req.query.rating;
    const status = req.query.status;

    const where = {};
    if (materialId) where.materialId = materialId;
    if (advertisementId) where.advertisementId = advertisementId;
    if (targetUserId) where.targetUserId = targetUserId;
    if (rating) where.rating = rating;
    if (status) where.status = status;

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: db.user,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Advertisement,
          as: 'advertisement',
          attributes: ['id', 'title'],
          required: false
        },
        {
          model: db.user,
          as: 'targetUser',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.send({
      reviews: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения отзывов"
    });
  }
};

// Get review by ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id, {
      include: [
        {
          model: db.user,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Advertisement,
          as: 'advertisement',
          attributes: ['id', 'title'],
          required: false
        },
        {
          model: db.user,
          as: 'targetUser',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          required: false
        }
      ]
    });

    if (!review) {
      return res.status(404).send({
        message: "Отзыв не найден"
      });
    }

    res.send(review);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения отзыва"
    });
  }
};

// Update review
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).send({
        message: "Отзыв не найден"
      });
    }

    if (review.userId !== req.userId) {
      return res.status(403).send({
        message: "Доступ запрещен"
      });
    }

    // Remove sensitive fields
    delete updateData.userId;
    delete updateData.materialId;
    delete updateData.advertisementId;
    delete updateData.targetUserId;

    await review.update(updateData);

    // Update material rating if material review
    if (review.materialId) {
      await updateMaterialRating(review.materialId);
    }

    const updatedReview = await Review.findByPk(id, {
      include: [
        {
          model: db.user,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Advertisement,
          as: 'advertisement',
          attributes: ['id', 'title'],
          required: false
        }
      ]
    });

    res.send({
      message: "Отзыв успешно обновлен",
      review: updatedReview
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления отзыва"
    });
  }
};

// Delete review
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).send({
        message: "Отзыв не найден"
      });
    }

    if (review.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).send({
        message: "Доступ запрещен"
      });
    }

    const materialId = review.materialId;
    await review.destroy();

    // Update material rating if material review
    if (materialId) {
      await updateMaterialRating(materialId);
    }

    res.send({
      message: "Отзыв успешно удален"
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка удаления отзыва"
    });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).send({
        message: "Отзыв не найден"
      });
    }

    await review.increment('helpfulCount');

    res.send({
      message: "Отзыв отмечен как полезный",
      helpfulCount: review.helpfulCount + 1
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка отметки отзыва как полезного"
    });
  }
};

// Admin: Approve/Reject review
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    if (req.userRole !== 'admin') {
      return res.status(403).send({
        message: "Только администратор может изменять статус отзыва"
      });
    }

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).send({
        message: "Отзыв не найден"
      });
    }

    const updateData = { status };
    if (response) {
      updateData.response = response;
      updateData.responseDate = new Date();
    }

    await review.update(updateData);

    res.send({
      message: "Статус отзыва обновлен",
      review
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления статуса отзыва"
    });
  }
};

// Helper function to update material rating
async function updateMaterialRating(materialId) {
  try {
    const reviews = await Review.findAll({
      where: { 
        materialId,
        status: 'approved'
      },
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'avgRating'],
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'reviewCount']
      ]
    });

    const avgRating = reviews[0].dataValues.avgRating || 0;
    const reviewCount = reviews[0].dataValues.reviewCount || 0;

    await Material.update({
      rating: parseFloat(avgRating).toFixed(2),
      reviewCount
    }, {
      where: { id: materialId }
    });
  } catch (error) {
    console.error('Error updating material rating:', error);
  }
}
