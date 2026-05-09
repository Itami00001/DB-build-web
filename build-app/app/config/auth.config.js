module.exports = {
  secret: process.env.JWT_SECRET || "build-shop-secret-key-change-in-production",
  jwtExpiration: process.env.JWT_EXPIRE || "7d",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "build-shop-refresh-secret-key",
  refreshExpiration: process.env.JWT_REFRESH_EXPIRE || "30d",
  passwordResetSecret: process.env.JWT_PASSWORD_RESET_SECRET || "build-shop-password-reset-secret",
  passwordResetExpiration: process.env.JWT_PASSWORD_RESET_EXPIRE || "1h"
};
