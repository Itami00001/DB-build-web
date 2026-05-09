const db = require("../models");
const Material = db.material;
const MaterialCategory = db.materialCategory;
const Review = db.review;
const { Op } = db.Sequelize;

// Create material
exports.create = async (req, res) => {
  try {
    const { name, description, categoryId, price, unit, inStock, minOrder, image, specifications } = req.body;

    // Check if category exists
    const category = await MaterialCategory.findByPk(categoryId);
    if (!category) {
      return res.status(404).send({
        message: "Категория не найдена"
      });
    }

    const material = await Material.create({
      name,
      description,
      categoryId,
      price,
      unit: unit || 'шт',
      inStock: inStock || 0,
      minOrder: minOrder || 1,
      image,
      specifications: specifications || {}
    });

    res.status(201).send({
      message: "Материал успешно создан",
      material
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка создания материала"
    });
  }
};

// Get all materials
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const categoryId = req.query.categoryId;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const inStock = req.query.inStock === 'true';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'DESC';

    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice) {
      where.price = { [Op.gte]: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };
    }

    if (inStock) {
      where.inStock = { [Op.gt]: 0 };
    }

    const { count, rows } = await Material.findAndCountAll({
      where,
      include: [
        {
          model: MaterialCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    res.send({
      materials: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения материалов"
    });
  }
};

// Get material by ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id, {
      include: [
        {
          model: MaterialCategory,
          as: 'category',
          attributes: ['id', 'name', 'description']
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: db.user,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ],
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!material) {
      return res.status(404).send({
        message: "Материал не найден"
      });
    }

    res.send(material);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения материала"
    });
  }
};

// Update material
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If category is being updated, check if it exists
    if (updateData.categoryId) {
      const category = await MaterialCategory.findByPk(updateData.categoryId);
      if (!category) {
        return res.status(404).send({
          message: "Категория не найдена"
        });
      }
    }

    const [updatedRowsCount] = await Material.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).send({
        message: "Материал не найден"
      });
    }

    const updatedMaterial = await Material.findByPk(id, {
      include: [
        {
          model: MaterialCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    res.send({
      message: "Материал успешно обновлен",
      material: updatedMaterial
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления материала"
    });
  }
};

// Delete material
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if material has advertisements
    const advertisementsCount = await db.advertisement.count({
      where: { materialId: id }
    });

    if (advertisementsCount > 0) {
      return res.status(400).send({
        message: "Нельзя удалить материал с объявлениями"
      });
    }

    const deletedRowsCount = await Material.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).send({
        message: "Материал не найден"
      });
    }

    res.send({
      message: "Материал успешно удален"
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка удаления материала"
    });
  }
};

// Get featured materials
exports.getFeatured = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const materials = await Material.findAll({
      where: { 
        isActive: true,
        inStock: { [Op.gt]: 0 }
      },
      include: [
        {
          model: MaterialCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['rating', 'DESC'], ['reviewCount', 'DESC']],
      limit
    });

    res.send(materials);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения избранных материалов"
    });
  }
};

// Get materials by category
exports.getByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get all subcategories
    const getAllSubcategories = async (categoryId) => {
      const subcategories = await MaterialCategory.findAll({
        where: { parentCategoryId: categoryId }
      });
      
      let allIds = [categoryId];
      for (const subcategory of subcategories) {
        allIds = [...allIds, ...(await getAllSubcategories(subcategory.id))];
      }
      return allIds;
    };

    const categoryIds = await getAllSubcategories(categoryId);

    const { count, rows } = await Material.findAndCountAll({
      where: { 
        categoryId: { [Op.in]: categoryIds },
        isActive: true
      },
      include: [
        {
          model: MaterialCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    res.send({
      materials: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения материалов по категории"
    });
  }
};
