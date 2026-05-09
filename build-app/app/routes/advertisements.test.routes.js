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
   * /api/advertisements/all:
   *   get:
   *     summary: Получить все объявления (временный эндпоинт)
   *     tags: [Advertisements]
   *     responses:
   *       200:
   *         description: Список всех объявлений
   */
  app.get("/api/advertisements/all", (req, res) => {
    try {
      // Возвращаем простые тестовые объявления
      const advertisements = [
        { id: 1, title: "Кирпич силикатный М-100", description: "Силикатный кирпич одинарный", price: 15.50, quantity: 1000, status: "active", material: { id: 1, name: "Кирпич силикатный" }, user: { id: 1, username: "test" } },
        { id: 2, title: "Бетон М-200", description: "Готовый бетон для фундамента", price: 3500.00, quantity: 5, status: "active", material: { id: 2, name: "Бетон М-200" }, user: { id: 2, username: "test1" } },
        { id: 3, title: "Цемент М-500", description: "Портландцемент в мешках", price: 420.00, quantity: 100, status: "active", material: { id: 3, name: "Цемент М-500" }, user: { id: 3, username: "test2" } },
        { id: 4, title: "Арматура А500 12мм", description: "Арматура для фундамента", price: 45000.00, quantity: 2, status: "active", material: { id: 4, name: "Арматура А500" }, user: { id: 4, username: "admin" } },
        { id: 5, title: "Пеноблок D600", description: "Пеноблоки для стен", price: 3200.00, quantity: 10, status: "active", material: { id: 5, name: "Пеноблок D600" }, user: { id: 1, username: "test" } },
        { id: 6, title: "Керамзит", description: "Керамзит для бетона", price: 1800.00, quantity: 15, status: "active", material: { id: 6, name: "Керамзит" }, user: { id: 2, username: "test1" } },
        { id: 7, title: "Гипсокартон 12.5мм", description: "Гипсокартон для перегородок", price: 380.00, quantity: 20, status: "active", material: { id: 7, name: "Гипсокартон" }, user: { id: 3, username: "test2" } },
        { id: 8, title: "Минеральная вата 100мм", description: "Утеплитель для стен", price: 550.00, quantity: 30, status: "active", material: { id: 8, name: "Минеральная вата" }, user: { id: 4, username: "admin" } }
      ];
      
      console.log(`Возвращено объявлений: ${advertisements.length}`);
      res.json(advertisements);
    } catch (error) {
      console.error("Ошибка получения объявлений:", error);
      res.status(500).json({ message: "Ошибка получения объявлений" });
    }
  });
};
