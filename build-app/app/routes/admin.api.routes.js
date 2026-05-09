const { verifyToken, isAdmin } = require("../middleware/auth.middleware");
const controller = require("../controllers/admin.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Статистика для админ панели
  app.get(
    "/api/admin/stats/users",
    [verifyToken, isAdmin],
    controller.getUsersStats
  );

  app.get(
    "/api/admin/stats/materials", 
    [verifyToken, isAdmin],
    controller.getMaterialsStats
  );

  app.get(
    "/api/admin/stats/advertisements",
    [verifyToken, isAdmin], 
    controller.getAdvertisementsStats
  );

  app.get(
    "/api/admin/stats/transactions",
    [verifyToken, isAdmin],
    controller.getTransactionsStats
  );

  // Получение всех данных таблиц
  app.get(
    "/api/admin/users",
    [verifyToken, isAdmin],
    controller.getAllUsers
  );

  app.get(
    "/api/admin/transactions",
    [verifyToken, isAdmin],
    controller.getAllTransactions
  );

  app.get(
    "/api/admin/materials",
    [verifyToken, isAdmin],
    controller.getAllMaterials
  );

  app.get(
    "/api/admin/advertisements",
    [verifyToken, isAdmin],
    controller.getAllAdvertisements
  );

  // Экспорт в PDF
  app.get(
    "/api/admin/export/pdf/:tableName",
    [verifyToken, isAdmin],
    controller.exportTableToPDF
  );

  // Логи системы
  app.get(
    "/api/admin/logs",
    [verifyToken, isAdmin],
    controller.getSystemLogs
  );

  // Управление пользователями
  app.post(
    "/api/admin/users/:userId/reward",
    [verifyToken, isAdmin],
    controller.rewardUser
  );

  app.put(
    "/api/admin/users/:userId/balance",
    [verifyToken, isAdmin],
    controller.updateUserBalance
  );

  app.put(
    "/api/admin/users/:userId/status",
    [verifyToken, isAdmin],
    controller.updateUserStatus
  );
};
