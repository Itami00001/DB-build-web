'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Начинаем миграцию материалов...');
      
      // Отключаем проверки внешних ключей
      await queryInterface.sequelize.query('SET session_replication_role = replica;');
      
      // Удаляем существующие материалы и категории
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS materials CASCADE;');
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS materialCategories CASCADE;');
      
      // Создаем таблицу категорий
      await queryInterface.createTable('materialCategories', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        parentCategoryId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'materialCategories',
            key: 'id'
          }
        },
        level: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        sortOrder: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
      
      // Создаем таблицу материалов
      await queryInterface.createTable('materials', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        categoryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'materialCategories',
            key: 'id'
          }
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        unit: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        inStock: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0
        },
        minOrder: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 1
        },
        image: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        specifications: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {}
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        rating: {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: false,
          defaultValue: 0
        },
        reviewCount: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
      
      // Включаем обратно проверки внешних ключей
      await queryInterface.sequelize.query('SET session_replication_role = DEFAULT;');
      
      // Вставляем 10 категорий
      await queryInterface.sequelize.query(`
        INSERT INTO materialCategories (name, description, level, isActive, sortOrder, createdAt, updatedAt) VALUES
        ('Кирпич', 'Все виды кирпича', 1, true, 1, NOW(), NOW()),
        ('Блоки', 'Стеновые блоки', 1, true, 2, NOW(), NOW()),
        ('Краски', 'Краски и лакокрасочные материалы', 1, true, 3, NOW(), NOW()),
        ('Цемент', 'Цемент и сухие смеси', 1, true, 4, NOW(), NOW()),
        ('Песок', 'Песок и щебень', 1, true, 5, NOW(), NOW()),
        ('Арматура', 'Арматура и металлопрокат', 1, true, 6, NOW(), NOW()),
        ('Утеплитель', 'Теплоизоляционные материалы', 1, true, 7, NOW(), NOW()),
        ('Гидроизоляция', 'Гидроизоляционные материалы', 1, true, 8, NOW(), NOW()),
        ('Кровля', 'Кровельные материалы', 1, true, 9, NOW(), NOW()),
        ('Инструменты', 'Строительные инструменты', 1, true, 10, NOW(), NOW())
      `);
      
      // Вставляем материалы
      await queryInterface.sequelize.query(`
        INSERT INTO materials (name, description, categoryId, price, unit, inStock, minOrder, isActive, rating, reviewCount, createdAt, updatedAt) VALUES
        ('Кирпич', 'Строительный кирпич', 1, 15.5, 'шт', 10000, 100, true, 4.5, 23, NOW(), NOW()),
        ('Блоки', 'Стеновые блоки', 2, 125, 'шт', 500, 10, true, 4.7, 15, NOW(), NOW()),
        ('Краски', 'Лакокрасочные материалы', 3, 280, 'л', 150, 5, true, 4.4, 19, NOW(), NOW()),
        ('Цемент', 'Цемент и сухие смеси', 4, 4200, 'т', 80, 1, true, 4.7, 31, NOW(), NOW()),
        ('Песок', 'Песок и щебень', 5, 450, 'м³', 50, 5, true, 4.3, 16, NOW(), NOW()),
        ('Арматура', 'Стальная арматура', 6, 45, 'т', 50, 0.5, true, 4.3, 31, NOW(), NOW()),
        ('Утеплитель', 'Теплоизоляционные материалы', 7, 850, 'м³', 30, 1, true, 4.8, 24, NOW(), NOW()),
        ('Гидроизоляция', 'Гидроизоляционные материалы', 8, 280, 'м²', 500, 15, true, 4.5, 20, NOW(), NOW()),
        ('Кровля', 'Кровельные материалы', 9, 320, 'м²', 1000, 50, true, 4.6, 27, NOW(), NOW()),
        ('Инструменты', 'Строительные инструменты', 10, 3500, 'шт', 20, 1, true, 4.6, 34, NOW(), NOW())
      `);
      
      console.log('✅ Миграция материалов успешно завершена!');
      
    } catch (error) {
      console.error('❌ Ошибка при миграции:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Откатываем миграцию материалов...');
      
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS materials CASCADE;');
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS materialCategories CASCADE;');
      
      console.log('✅ Миграция успешно откачена!');
      
    } catch (error) {
      console.error('❌ Ошибка при откате миграции:', error);
      throw error;
    }
  }
};
