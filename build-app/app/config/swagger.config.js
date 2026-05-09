const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Build-Shop API',
      version: '1.0.0',
      description: 'API для строительной фирмы с системой объявлений и C-coin валютой',
      contact: {
        name: 'Build-Shop Team',
        email: 'support@build-shop.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.build-shop.com' 
          : `http://localhost:${process.env.NODE_DOCKER_PORT || 8080}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT токен авторизации'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор пользователя'
            },
            username: {
              type: 'string',
              description: 'Имя пользователя'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя'
            },
            firstName: {
              type: 'string',
              description: 'Имя'
            },
            lastName: {
              type: 'string',
              description: 'Фамилия'
            },
            phone: {
              type: 'string',
              description: 'Номер телефона'
            },
            birthDate: {
              type: 'string',
              format: 'date',
              description: 'Дата рождения'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Роль пользователя'
            },
            cCoinBalance: {
              type: 'number',
              description: 'Баланс C-coin валюты'
            }
          }
        },
        MaterialCategory: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор категории'
            },
            name: {
              type: 'string',
              description: 'Название категории'
            },
            description: {
              type: 'string',
              description: 'Описание категории'
            },
            parentCategoryId: {
              type: 'integer',
              description: 'ID родительской категории'
            }
          }
        },
        Material: {
          type: 'object',
          required: ['name', 'categoryId'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор материала'
            },
            name: {
              type: 'string',
              description: 'Название материала'
            },
            description: {
              type: 'string',
              description: 'Описание материала'
            },
            categoryId: {
              type: 'integer',
              description: 'ID категории материала'
            },
            price: {
              type: 'number',
              description: 'Цена материала'
            },
            unit: {
              type: 'string',
              description: 'Единица измерения'
            },
            inStock: {
              type: 'number',
              description: 'Количество на складе'
            },
            image: {
              type: 'string',
              description: 'URL изображения'
            }
          }
        },
        Advertisement: {
          type: 'object',
          required: ['title', 'materialId', 'price', 'quantity'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор объявления'
            },
            title: {
              type: 'string',
              description: 'Заголовок объявления'
            },
            description: {
              type: 'string',
              description: 'Описание объявления'
            },
            materialId: {
              type: 'integer',
              description: 'ID материала'
            },
            userId: {
              type: 'integer',
              description: 'ID пользователя'
            },
            price: {
              type: 'number',
              description: 'Цена в C-coin'
            },
            quantity: {
              type: 'number',
              description: 'Количество материала'
            },
            status: {
              type: 'string',
              enum: ['active', 'sold', 'inactive'],
              description: 'Статус объявления'
            }
          }
        },
        Transaction: {
          type: 'object',
          required: ['senderId', 'receiverId', 'amount'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор транзакции'
            },
            senderId: {
              type: 'integer',
              description: 'ID отправителя'
            },
            receiverId: {
              type: 'integer',
              description: 'ID получателя'
            },
            amount: {
              type: 'number',
              description: 'Сумма транзакции'
            },
            type: {
              type: 'string',
              enum: ['transfer', 'purchase', 'reward'],
              description: 'Тип транзакции'
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed'],
              description: 'Статус транзакции'
            },
            description: {
              type: 'string',
              description: 'Описание транзакции'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Сообщение об ошибке'
            },
            error: {
              type: 'object',
              description: 'Детали ошибки'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./app/routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = specs;
