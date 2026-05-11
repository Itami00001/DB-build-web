const { verifyToken, isAdmin } = require("../middleware/authJwt");
const controller = require("../controllers/export.controller");

module.exports = app => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Экспорт пользователей в PDF
  app.get(
    "/api/export/users/pdf",
    [verifyToken, isAdmin],
    controller.exportUsersPDF
  );

  // Экспорт объявлений в PDF
  app.get(
    "/api/export/advertisements/pdf",
    [verifyToken, isAdmin],
    controller.exportAdvertisementsPDF
  );

  // Экспорт транзакций в PDF
  app.get(
    "/api/export/transactions/pdf",
    [verifyToken, isAdmin],
    controller.exportTransactionsPDF
  );
};
