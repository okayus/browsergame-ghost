-- ===================
-- 技マスタデータ
-- ===================

-- ノーマルタイプ
INSERT INTO moves (id, name, type, power, accuracy, pp, description) VALUES
  ('tackle', 'たいあたり', 'normal', 40, 100, 35, '体当たりで攻撃する基本技'),
  ('scratch', 'ひっかく', 'normal', 40, 100, 35, '鋭い爪でひっかく'),
  ('slam', 'たたきつける', 'normal', 80, 75, 20, '体全体で叩きつける強力な技');

-- 炎タイプ
INSERT INTO moves (id, name, type, power, accuracy, pp, description) VALUES
  ('ember', 'ひのこ', 'fire', 40, 100, 25, '小さな炎を放つ基本技'),
  ('flameCharge', 'ニトロチャージ', 'fire', 50, 100, 20, '炎をまといながら突進する'),
  ('flamethrower', 'かえんほうしゃ', 'fire', 90, 100, 15, '激しい炎を放射する強力な技');

-- 水タイプ
INSERT INTO moves (id, name, type, power, accuracy, pp, description) VALUES
  ('bubble', 'あわ', 'water', 40, 100, 30, '泡を飛ばして攻撃する基本技'),
  ('waterGun', 'みずでっぽう', 'water', 40, 100, 25, '水を勢いよく発射する'),
  ('hydroPump', 'ハイドロポンプ', 'water', 110, 80, 5, '超高圧の水流で攻撃する必殺技');

-- 草タイプ
INSERT INTO moves (id, name, type, power, accuracy, pp, description) VALUES
  ('vineWhip', 'つるのムチ', 'grass', 45, 100, 25, 'ツルで叩いて攻撃する'),
  ('razorLeaf', 'はっぱカッター', 'grass', 55, 95, 25, '鋭い葉っぱを飛ばして攻撃'),
  ('solarBeam', 'ソーラービーム', 'grass', 120, 100, 10, '太陽光を集めて放つ強力な光線');

-- 電気タイプ
INSERT INTO moves (id, name, type, power, accuracy, pp, description) VALUES
  ('thunderShock', 'でんきショック', 'electric', 40, 100, 30, '電気を放って攻撃する基本技'),
  ('spark', 'スパーク', 'electric', 65, 100, 20, '電気をまといながら体当たり'),
  ('thunderbolt', '10まんボルト', 'electric', 90, 100, 15, '強力な電撃を浴びせる');

-- 霊タイプ
INSERT INTO moves (id, name, type, power, accuracy, pp, description) VALUES
  ('lick', 'したでなめる', 'ghost', 30, 100, 30, '長い舌で舐めて攻撃する'),
  ('shadowBall', 'シャドーボール', 'ghost', 80, 100, 15, '影の塊を投げつける'),
  ('phantomForce', 'ゴーストダイブ', 'ghost', 90, 100, 10, '異次元から攻撃する強力な技');

-- ===================
-- ゴースト種族マスタデータ
-- ===================

INSERT INTO ghost_species (id, name, type, description, rarity, base_hp, base_attack, base_defense, base_speed) VALUES
  ('fireling', 'ヒダマリン', 'fire', '体内で常に小さな炎が燃えている。寒い場所が苦手。', 'common', 45, 60, 40, 70),
  ('aquaspirit', 'アクアゴースト', 'water', '水辺に現れる霊体。雨の日は特に活発になる。', 'common', 55, 50, 55, 55),
  ('leafshade', 'リーフシェイド', 'grass', '森の中で葉っぱに擬態している。光合成でエネルギーを得る。', 'common', 50, 55, 60, 50),
  ('sparkghost', 'スパークゴースト', 'electric', '電化製品に取り憑くことが多い。雷雨の日に活発化する。', 'uncommon', 40, 55, 35, 90),
  ('shadowwisp', 'シャドウウィスプ', 'ghost', '暗闇に潜む謎多き霊体。実体を持たず壁をすり抜ける。', 'rare', 50, 70, 45, 65),
  ('spiritpuff', 'スピリパフ', 'normal', 'ふわふわした見た目の親しみやすいゴースト。初心者向け。', 'common', 60, 45, 50, 55);

-- ===================
-- 習得可能技マスタデータ
-- ===================

-- ヒダマリン (fireling)
INSERT INTO learnable_moves (species_id, move_id, level) VALUES
  ('fireling', 'tackle', 1),
  ('fireling', 'ember', 1),
  ('fireling', 'flameCharge', 8),
  ('fireling', 'scratch', 15),
  ('fireling', 'flamethrower', 22);

-- アクアゴースト (aquaspirit)
INSERT INTO learnable_moves (species_id, move_id, level) VALUES
  ('aquaspirit', 'tackle', 1),
  ('aquaspirit', 'bubble', 1),
  ('aquaspirit', 'waterGun', 7),
  ('aquaspirit', 'scratch', 14),
  ('aquaspirit', 'hydroPump', 25);

-- リーフシェイド (leafshade)
INSERT INTO learnable_moves (species_id, move_id, level) VALUES
  ('leafshade', 'tackle', 1),
  ('leafshade', 'vineWhip', 1),
  ('leafshade', 'razorLeaf', 9),
  ('leafshade', 'scratch', 16),
  ('leafshade', 'solarBeam', 28);

-- スパークゴースト (sparkghost)
INSERT INTO learnable_moves (species_id, move_id, level) VALUES
  ('sparkghost', 'tackle', 1),
  ('sparkghost', 'thunderShock', 1),
  ('sparkghost', 'spark', 6),
  ('sparkghost', 'scratch', 12),
  ('sparkghost', 'thunderbolt', 20);

-- シャドウウィスプ (shadowwisp)
INSERT INTO learnable_moves (species_id, move_id, level) VALUES
  ('shadowwisp', 'lick', 1),
  ('shadowwisp', 'tackle', 1),
  ('shadowwisp', 'shadowBall', 10),
  ('shadowwisp', 'scratch', 18),
  ('shadowwisp', 'phantomForce', 30);

-- スピリパフ (spiritpuff)
INSERT INTO learnable_moves (species_id, move_id, level) VALUES
  ('spiritpuff', 'tackle', 1),
  ('spiritpuff', 'scratch', 1),
  ('spiritpuff', 'slam', 5);

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
