const db = require("../models");
const bcrypt = require("bcryptjs");

/**
 * Начальные аккаунты пользователей согласно test.txt
 * Создает тестовых пользователей для строй-фирмы
 */
const seedUsers = async () => {
  try {
    console.log("Создание начальных аккаунтов пользователей...");

    // Создаем пользователей согласно требованиям из test.txt
    const users = await db.user.bulkCreate([
      {
        username: "test",
        email: "test@gmail.com",
        password: bcrypt.hashSync("testtest", 8),
        firstName: "Тестовый",
        lastName: "Пользователь",
        phone: "+71234567890",
        birthDate: "1990-01-01",
        role: "user",
        cCoinBalance: 100,
        isActive: true
      },
      {
        username: "test1",
        email: "test1@gmail.com",
        password: bcrypt.hashSync("test1test1", 8),
        firstName: "Первый",
        lastName: "Тестовый",
        phone: "+72345678901",
        birthDate: "1985-05-15",
        role: "user",
        cCoinBalance: 50,
        isActive: true
      },
      {
        username: "test2",
        email: "test2@gmail.com",
        password: bcrypt.hashSync("test2test2", 8),
        firstName: "Второй",
        lastName: "Тестовый",
        phone: "+73456789012",
        birthDate: "1992-10-20",
        role: "user",
        cCoinBalance: 75,
        isActive: true
      },
      {
        username: "admin",
        email: "admin@gmail.com",
        password: bcrypt.hashSync("adminadmin", 8),
        firstName: "Администратор",
        lastName: "Системы",
        phone: "+71112223344",
        birthDate: "1980-01-01",
        role: "admin",
        cCoinBalance: 1000,
        isActive: true
      }
    ]);

    console.log(`✅ Создано ${users.length} пользователей:`);
    console.log("📝 Данные для входа:");
    console.log("  test / testtest - обычный пользователь (100 C-коинов)");
    console.log("  test1 / test1test1 - обычный пользователь (50 C-коинов)");
    console.log("  test2 / test2test2 - обычный пользователь (75 C-коинов)");
    console.log("  admin / adminadmin - администратор (1000 C-коинов)");

    return users;

  } catch (error) {
    console.error("❌ Ошибка при создании пользователей:", error);
    throw error;
  }
};

module.exports = { seedUsers };
