-- ===================
-- アイテムマスタデータ
-- ===================

-- 回復アイテム
INSERT INTO items (id, name, category, description, effect_value, price) VALUES
  ('potion', 'ポーション', 'healing', 'HPを20回復する基本的な回復薬。', 20, 100),
  ('superPotion', 'スーパーポーション', 'healing', 'HPを50回復する高品質な回復薬。', 50, 300),
  ('hyperPotion', 'ハイパーポーション', 'healing', 'HPを120回復する最高級の回復薬。', 120, 600),
  ('maxPotion', 'まんたんのくすり', 'healing', 'HPを完全に回復する究極の回復薬。', 9999, 1500),
  ('revive', 'げんきのかけら', 'healing', '瀕死のゴーストをHP半分で復活させる。', 50, 800);

-- 捕獲アイテム
INSERT INTO items (id, name, category, description, effect_value, price) VALUES
  ('ghostBall', 'ゴーストボール', 'capture', '野生のゴーストを捕まえる基本的なボール。捕獲率ボーナス: 0%', 0, 100),
  ('greatBall', 'スーパーボール', 'capture', '捕獲性能が向上したボール。捕獲率ボーナス: +20%', 20, 300),
  ('ultraBall', 'ハイパーボール', 'capture', '高性能な捕獲ボール。捕獲率ボーナス: +40%', 40, 600),
  ('masterBall', 'マスターボール', 'capture', '必ず捕獲できる究極のボール。非売品。', 100, 0);
