-- Начальные данные для таблицы пользователей
-- Вставка выполняется только если таблица пустая

INSERT INTO "user" (username, email, password, first_name, last_name, phone, birth_date, role, c_coin_balance, is_active, last_login, created_at, updated_at)
VALUES 
('test', 'test@gmail.com', '$2a$08$peW5gTpyWBGvrfwS6S3TNuefEA9ydJ85PKP8KAvnTZDYhErUmSK7S', 'Тестовый', 'Пользователь', '+71234567890', '1990-01-01', 'user', 100.00, true, NULL, '2026-05-12T15:27:10.031Z', '2026-05-12T15:27:10.031Z')
ON CONFLICT (username) DO NOTHING;

INSERT INTO "user" (username, email, password, first_name, last_name, phone, birth_date, role, c_coin_balance, is_active, last_login, created_at, updated_at)
VALUES 
('test1', 'test1@gmail.com', '$2a$08$Z1ZXjLYhAnw6ZaDv87vhDOFwc9lxGMNiSoldjmfRo2HkNFb5ZZL.u', 'Первый', 'Тестовый', '+72345678901', '1985-05-15', 'user', 50.00, true, NULL, '2026-05-12T15:27:10.031Z', '2026-05-12T15:27:10.031Z')
ON CONFLICT (username) DO NOTHING;

INSERT INTO "user" (username, email, password, first_name, last_name, phone, birth_date, role, c_coin_balance, is_active, last_login, created_at, updated_at)
VALUES 
('test2', 'test2@gmail.com', '$2a$08$.T9zlX90EmBLijFDlrTX/.aaIrpy8tveVpl9x2zhpzwr7PevAQheW', 'Второй', 'Тестовый', '+73456789012', '1992-10-20', 'user', 75.00, true, NULL, '2026-05-12T15:27:10.031Z', '2026-05-12T15:27:10.031Z')
ON CONFLICT (username) DO NOTHING;

INSERT INTO "user" (username, email, password, first_name, last_name, phone, birth_date, role, c_coin_balance, is_active, last_login, created_at, updated_at)
VALUES 
('admin', 'admin@gmail.com', '$2a$08$y5O68rEr9IuSe9F32FdRJeZTjwe2If.a99rQUkysuvrQQFIaDKloy', 'Администратор', 'Системы', '+71112223344', '1980-01-01', 'admin', 1000.00, true, NULL, '2026-05-12T15:27:10.031Z', '2026-05-12T15:27:10.031Z')
ON CONFLICT (username) DO NOTHING;
