const db = require("../models");
const MaterialCategory = db.materialCategory;
const Material = db.material;
const { Op } = db.Sequelize;

// Create material category
exports.create = async (req, res) => {
  try {
    const { name, description, parentCategoryId } = req.body;

    // Check if category already exists
    const existingCategory = await MaterialCategory.findOne({
      where: { name }
    });

    if (existingCategory) {
      return res.status(400).send({
        message: "Категория с таким названием уже существует"
      });
    }

    // Calculate level
    let level = 1;
    if (parentCategoryId) {
      const parentCategory = await MaterialCategory.findByPk(parentCategoryId);
      if (!parentCategory) {
        return res.status(404).send({
          message: "Родительская категория не найдена"
        });
      }
      level = parentCategory.level + 1;
    }

    const category = await MaterialCategory.create({
      name,
      description,
      parentCategoryId,
      level
    });

    res.status(201).send({
      message: "Категория успешно создана",
      category
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка создания категории"
    });
  }
};

// Get all material categories
exports.findAll = async (req, res) => {
  try {
    const includeChildren = req.query.includeChildren === 'true';
    const parentOnly = req.query.parentOnly === 'true';
    const search = req.query.search || '';

    const where = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    if (parentOnly) {
      where.parentCategoryId = null;
    }

    const include = [];
    if (includeChildren) {
      include.push({
        model: MaterialCategory,
        as: 'subcategories',
        include: [{
          model: MaterialCategory,
          as: 'subcategories'
        }]
      });
    }

    const categories = await MaterialCategory.findAll({
      where,
      include,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.send(categories);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения категорий"
    });
  }
};

// Get category tree
exports.getTree = async (req, res) => {
  try {
    const categories = await MaterialCategory.findAll({
      where: { isActive: true },
      include: [
        {
          model: Material,
          as: 'materials',
          attributes: ['id'],
          required: false
        }
      ],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    // Build tree structure
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parentCategoryId === parentId)
        .map(item => ({
          ...item.toJSON(),
          children: buildTree(items, item.id),
          materialCount: item.materials ? item.materials.length : 0
        }));
    };

    const tree = buildTree(categories);

    res.send(tree);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения дерева категорий"
    });
  }
};

// Get category by ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await MaterialCategory.findByPk(id, {
      include: [
        {
          model: MaterialCategory,
          as: 'parentCategory',
          attributes: ['id', 'name']
        },
        {
          model: MaterialCategory,
          as: 'subcategories',
          attributes: ['id', 'name', 'level']
        },
        {
          model: Material,
          as: 'materials',
          attributes: ['id', 'name', 'price', 'inStock'],
          limit: 10
        }
      ]
    });

    if (!category) {
      return res.status(404).send({
        message: "Категория не найдена"
      });
    }

    res.send(category);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения категории"
    });
  }
};

// Update category
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Prevent creating circular references
    if (updateData.parentCategoryId) {
      if (parseInt(updateData.parentCategoryId) === parseInt(id)) {
        return res.status(400).send({
          message: "Категория не может быть родительской для самой себя"
        });
      }

      // Check for circular reference
      const checkCircularReference = async (categoryId, parentId) => {
        const parent = await MaterialCategory.findByPk(parentId);
        if (!parent) return false;
        
        if (parent.parentCategoryId === categoryId) return true;
        if (parent.parentCategoryId) {
          return await checkCircularReference(categoryId, parent.parentCategoryId);
        }
        return false;
      };

      const isCircular = await checkCircularReference(id, updateData.parentCategoryId);
      if (isCircular) {
        return res.status(400).send({
          message: "Обнаружена циклическая ссылка в иерархии категорий"
        });
      }

      // Update level
      const parentCategory = await MaterialCategory.findByPk(updateData.parentCategoryId);
      updateData.level = parentCategory.level + 1;
    }

    const [updatedRowsCount] = await MaterialCategory.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).send({
        message: "Категория не найдена"
      });
    }

    const updatedCategory = await MaterialCategory.findByPk(id);

    res.send({
      message: "Категория успешно обновлена",
      category: updatedCategory
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка обновления категории"
    });
  }
};

// Delete category
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has subcategories
    const subcategoriesCount = await MaterialCategory.count({
      where: { parentCategoryId: id }
    });

    if (subcategoriesCount > 0) {
      return res.status(400).send({
        message: "Нельзя удалить категорию с подкатегориями"
      });
    }

    // Check if category has materials
    const materialsCount = await Material.count({
      where: { categoryId: id }
    });

    if (materialsCount > 0) {
      return res.status(400).send({
        message: "Нельзя удалить категорию с материалами"
      });
    }

    const deletedRowsCount = await MaterialCategory.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).send({
        message: "Категория не найдена"
      });
    }

    res.send({
      message: "Категория успешно удалена"
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка удаления категории"
    });
  }
};
