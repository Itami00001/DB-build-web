-- Начальные данные для таблицы категорий материалов
-- Вставка выполняется только если таблица пустая

INSERT INTO "materialCategories" (name, description, parent_category_id, level, is_active, sort_order, created_at, updated_at)
VALUES 
('Стеновые материалы', 'Материалы для возведения стен и перегородок', NULL, 1, true, 1, '2026-05-12T15:27:10.046Z', '2026-05-12T15:27:10.046Z')
ON CONFLICT DO NOTHING;

INSERT INTO "materialCategories" (name, description, parent_category_id, level, is_active, sort_order, created_at, updated_at)
VALUES 
('Кровельные материалы', 'Материалы для устройства кровли', NULL, 1, true, 2, '2026-05-12T15:27:10.046Z', '2026-05-12T15:27:10.046Z')
ON CONFLICT DO NOTHING;

INSERT INTO "materialCategories" (name, description, parent_category_id, level, is_active, sort_order, created_at, updated_at)
VALUES 
('Отделочные материалы', 'Материалы для внутренней и внешней отделки', NULL, 1, true, 3, '2026-05-12T15:27:10.046Z', '2026-05-12T15:27:10.046Z')
ON CONFLICT DO NOTHING;

INSERT INTO "materialCategories" (name, description, parent_category_id, level, is_active, sort_order, created_at, updated_at)
VALUES 
('Инженерные системы', 'Материалы для инженерных коммуникаций', NULL, 1, true, 4, '2026-05-12T15:27:10.046Z', '2026-05-12T15:27:10.046Z')
ON CONFLICT DO NOTHING;

INSERT INTO "materialCategories" (name, description, parent_category_id, level, is_active, sort_order, created_at, updated_at)
VALUES 
('Фундаментные материалы', 'Материалы для устройства фундамента', NULL, 1, true, 5, '2026-05-12T15:27:10.046Z', '2026-05-12T15:27:10.046Z')
ON CONFLICT DO NOTHING;

INSERT INTO "materialCategories" (name, description, parent_category_id, level, is_active, sort_order, created_at, updated_at)
VALUES 
('Изоляционные материалы', 'Тепло-, гидро- и звукоизоляция', NULL, 1, true, 6, '2026-05-12T15:27:10.046Z', '2026-05-12T15:27:10.046Z')
ON CONFLICT DO NOTHING;
