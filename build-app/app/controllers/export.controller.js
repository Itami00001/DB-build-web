const db = require("../models");
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Путь к шрифту внутри контейнера (Alpine Linux)
const fontPath = '/usr/share/fonts/dejavu/DejaVuSans.ttf';

// Экспорт пользователей в PDF
exports.exportUsersPDF = async (req, res) => {
  try {
    const users = await db.user.findAll({
      attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'cCoinBalance', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // Создаем PDF документ с поддержкой кириллицы
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    
    // Регистрируем кириллический шрифт
    doc.registerFont('CyrillicFont', fontPath);
    doc.font('CyrillicFont');
    
    // Добавляем контент
    doc.fontSize(20).text('Отчет по пользователям', { align: 'center' });
    doc.moveDown();
    
    // Дата генерации
    doc.fontSize(12).text(`Дата генерации: ${new Date().toLocaleString('ru-RU')}`, { align: 'right' });
    doc.moveDown();

    // Заголовки таблицы
    const tableTop = 120;
    const itemHeight = 30;
    const headers = ['ID', 'Имя', 'Email', 'Баланс C', 'Роль', 'Статус', 'Создан'];
    const columnWidths = [40, 80, 100, 60, 50, 60, 80];

    // Рисуем заголовки таблицы
    let currentX = 50;
    headers.forEach((header, i) => {
      doc.fontSize(10).text(header, currentX, tableTop, { width: columnWidths[i] });
      currentX += columnWidths[i];
    });

    // Рисуем линию под заголовками
    doc.moveTo(50, tableTop + 20)
       .lineTo(550, tableTop + 20)
       .stroke();

    // Данные пользователей
    let currentY = tableTop + 30;
    users.forEach((user, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      currentX = 50;
      const rowData = [
        user.id.toString(),
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.cCoinBalance.toString(),
        user.role,
        user.isActive ? 'Активен' : 'Неактивен',
        new Date(user.createdAt).toLocaleDateString('ru-RU')
      ];

      rowData.forEach((data, i) => {
        doc.fontSize(8).text(data, currentX, currentY, { width: columnWidths[i] });
        currentX += columnWidths[i];
      });

      currentY += itemHeight;
    });

    // Статистика внизу
    if (currentY > 650) {
      doc.addPage();
    }
    
    doc.fontSize(12).text(`Всего пользователей: ${users.length}`, 50, 720);
    doc.fontSize(10).text(`Активных: ${users.filter(u => u.isActive).length}`, 50, 735);
    doc.fontSize(10).text(`Администраторов: ${users.filter(u => u.role === 'admin').length}`, 200, 735);

    // Завершаем документ
    doc.end();
    
    // Отправляем результат
    doc.pipe(res);

  } catch (error) {
    console.error('Ошибка экспорта пользователей в PDF:', error);
    res.status(500).send({
      message: 'Ошибка экспорта в PDF'
    });
  }
};

// Экспорт объявлений в PDF
exports.exportAdvertisementsPDF = async (req, res) => {
  try {
    const advertisements = await db.advertisement.findAll({
      include: [
        {
          model: db.user,
          as: 'user',
          attributes: ['username']
        },
        {
          model: db.material,
          as: 'material',
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Создаем PDF документ с поддержкой кириллицы
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    
    // Регистрируем кириллический шрифт
    doc.registerFont('CyrillicFont', fontPath);
    doc.font('CyrillicFont');
    
    // Добавляем контент
    doc.fontSize(20).text('Отчет по объявлениям', { align: 'center' });
    doc.moveDown();
    
    // Дата генерации
    doc.fontSize(12).text(`Дата генерации: ${new Date().toLocaleString('ru-RU')}`, { align: 'right' });
    doc.moveDown();

    // Заголовки таблицы
    const tableTop = 120;
    const itemHeight = 30;
    const headers = ['ID', 'Заголовок', 'Материал', 'Цена C', 'Кол-во', 'Статус', 'Автор', 'Создано'];
    const columnWidths = [30, 100, 80, 50, 40, 60, 80, 70];

    // Рисуем заголовки таблицы
    let currentX = 50;
    headers.forEach((header, i) => {
      doc.fontSize(10).text(header, currentX, tableTop, { width: columnWidths[i] });
      currentX += columnWidths[i];
    });

    // Рисуем линию под заголовками
    doc.moveTo(50, tableTop + 20)
       .lineTo(550, tableTop + 20)
       .stroke();

    // Данные объявлений
    let currentY = tableTop + 30;
    advertisements.forEach((ad, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      currentX = 50;
      const rowData = [
        ad.id.toString(),
        ad.title.length > 15 ? ad.title.substring(0, 15) + '...' : ad.title,
        ad.material ? ad.material.name : 'Не указан',
        ad.price.toString(),
        ad.quantity.toString(),
        ad.status,
        ad.user ? ad.user.username : 'Не указан',
        new Date(ad.createdAt).toLocaleDateString('ru-RU')
      ];

      rowData.forEach((data, i) => {
        doc.fontSize(8).text(data, currentX, currentY, { width: columnWidths[i] });
        currentX += columnWidths[i];
      });

      currentY += itemHeight;
    });

    // Статистика внизу
    if (currentY > 650) {
      doc.addPage();
    }
    
    doc.fontSize(12).text(`Всего объявлений: ${advertisements.length}`, 50, 720);
    doc.fontSize(10).text(`Активных: ${advertisements.filter(a => a.status === 'active').length}`, 50, 735);
    doc.fontSize(10).text(`Проданных: ${advertisements.filter(a => a.status === 'sold').length}`, 200, 735);

    // Завершаем документ и создаем Buffer с правильной кодировкой
    doc.end();
    
    // Собираем PDF в Buffer с правильной кодировкой
    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="advertisements.pdf"; filename*=utf-8\'\'advertisements.pdf');
      res.send(pdfBuffer);
    });

  } catch (error) {
    console.error('Ошибка экспорта объявлений в PDF:', error);
    res.status(500).send({
      message: 'Ошибка экспорта в PDF'
    });
  }
};

// Экспорт транзакций в PDF
exports.exportTransactionsPDF = async (req, res) => {
  try {
    const transactions = await db.transaction.findAll({
      include: [
        {
          model: db.user,
          as: 'sender',
          attributes: ['username']
        },
        {
          model: db.user,
          as: 'receiver',
          attributes: ['username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Создаем PDF документ с поддержкой кириллицы
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    
    // Регистрируем кириллический шрифт
    doc.registerFont('CyrillicFont', fontPath);
    doc.font('CyrillicFont');
    
    // Добавляем контент
    doc.fontSize(20).text('Отчет по транзакциям', { align: 'center' });
    doc.moveDown();
    
    // Дата генерации
    doc.fontSize(12).text(`Дата генерации: ${new Date().toLocaleString('ru-RU')}`, { align: 'right' });
    doc.moveDown();

    // Заголовки таблицы
    const tableTop = 120;
    const itemHeight = 30;
    const headers = ['ID', 'Отправитель', 'Получатель', 'Сумма C', 'Тип', 'Описание', 'Дата'];
    const columnWidths = [30, 60, 60, 50, 40, 80, 60];

    // Рисуем заголовки таблицы
    let currentX = 50;
    headers.forEach((header, i) => {
      doc.fontSize(10).text(header, currentX, tableTop, { width: columnWidths[i] });
      currentX += columnWidths[i];
    });

    // Рисуем линию под заголовками
    doc.moveTo(50, tableTop + 20)
       .lineTo(550, tableTop + 20)
       .stroke();

    // Данные транзакций
    let currentY = tableTop + 30;
    transactions.forEach((transaction, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      currentX = 50;
      const rowData = [
        transaction.id.toString(),
        transaction.sender ? transaction.sender.username : 'Не указан',
        transaction.receiver ? transaction.receiver.username : 'Не указан',
        transaction.amount.toString(),
        transaction.type,
        transaction.description || 'Без описания',
        new Date(transaction.createdAt).toLocaleDateString('ru-RU')
      ];

      rowData.forEach((data, i) => {
        doc.fontSize(8).text(data, currentX, currentY, { width: columnWidths[i] });
        currentX += columnWidths[i];
      });

      currentY += itemHeight;
    });

    // Статистика внизу
    if (currentY > 650) {
      doc.addPage();
    }
    
    doc.fontSize(12).text(`Всего транзакций: ${transactions.length}`, 50, 720);
    doc.fontSize(10).text(`Переводов: ${transactions.filter(t => t.type === 'transfer').length}`, 50, 735);
    doc.fontSize(10).text(`Покупок: ${transactions.filter(t => t.type === 'purchase').length}`, 150, 735);

    // Завершаем документ
    doc.end();
    
    // Отправляем результат
    doc.pipe(res);

  } catch (error) {
    console.error('Ошибка экспорта транзакций в PDF:', error);
    res.status(500).send({
      message: 'Ошибка экспорта в PDF'
    });
  }
};
