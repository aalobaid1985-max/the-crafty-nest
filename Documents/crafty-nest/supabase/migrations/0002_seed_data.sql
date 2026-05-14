-- ============================================================
-- The Crafty Nest — Seed Data
-- Run AFTER 0001_initial_schema.sql
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================

-- Remove placeholder categories from migration 0001 first
DELETE FROM categories;

INSERT INTO categories (slug, name_ar, name_en, sort_order) VALUES
  ('flower-shop', 'محل الورد',     'Flower Shop', 1),
  ('car-shop',    'محل السيارات',  'Car Shop',    2);

-- ============================================================
-- PRODUCTS  (price: 9.500 KWD per package)
-- ============================================================

INSERT INTO products (slug, name_ar, name_en, description_ar, description_en, age_min, age_max, price_kwd, category_id, skill_tags, interaction_type, is_active, is_featured)
VALUES
  -- Flower Shop
  (
    'flower-shop-2-4',
    'باقة محل الورد ٢-٤ سنوات',
    'Flower Shop Bundle (Ages 2-4)',
    'باقة تعليمية مغناطيسية مميزة لعمر ٢-٤ سنوات بثيمة محل الورد. تحتوي على ٥ لوحات مغناطيسية A5، قطع مغناطيسية، دليل الأم، ألوان شمعية، وقلم ماركر.',
    'A magnetic educational bundle for ages 2-4 with a flower shop theme. Includes 5 A5 magnetic boards, magnetic pieces, parent guide, crayons, and marker.',
    2, 4, 9.500,
    (SELECT id FROM categories WHERE slug = 'flower-shop'),
    ARRAY['fine_motor','colors_shapes','counting_math']::skill_tag[],
    'parent_child', true, true
  ),
  (
    'flower-shop-4-6',
    'باقة محل الورد ٤-٦ سنوات',
    'Flower Shop Bundle (Ages 4-6)',
    'باقة تعليمية مغناطيسية لعمر ٤-٦ سنوات بثيمة محل الورد. تحتوي على ١٢ لوحة A5، قطع مغناطيسية، دليل الأم، وقلم ماركر.',
    'A magnetic educational bundle for ages 4-6 with a flower shop theme. Includes 12 A5 boards, magnetic pieces, parent guide, and marker.',
    4, 6, 9.500,
    (SELECT id FROM categories WHERE slug = 'flower-shop'),
    ARRAY['fine_motor','colors_shapes','problem_solving','counting_math']::skill_tag[],
    'parent_child', true, true
  ),
  (
    'flower-shop-6-8',
    'باقة محل الورد ٦-٨ سنوات',
    'Flower Shop Bundle (Ages 6-8)',
    'باقة تعليمية مغناطيسية لعمر ٦-٨ سنوات بثيمة محل الورد. تشمل لوحات متقدمة، واجهة محل قابلة للوقوف، لوحة open/close، عملات للعب، وأكثر.',
    'An advanced magnetic educational bundle for ages 6-8 with a flower shop theme. Includes advanced boards, a standing shop front, open/close sign, play money, and more.',
    6, 8, 9.500,
    (SELECT id FROM categories WHERE slug = 'flower-shop'),
    ARRAY['fine_motor','letters_language','counting_math','storytelling','creativity']::skill_tag[],
    'peer_group', true, true
  ),

  -- Car Shop
  (
    'car-shop-2-4',
    'باقة محل السيارات ٢-٤ سنوات',
    'Car Shop Bundle (Ages 2-4)',
    'باقة تعليمية مغناطيسية لعمر ٢-٤ سنوات بثيمة محل السيارات. تحتوي على ٥ لوحات A5، قطع مغناطيسية، دليل الأم، ألوان شمعية، وقلم ماركر.',
    'A magnetic educational bundle for ages 2-4 with a car shop theme. Includes 5 A5 boards, magnetic pieces, parent guide, crayons, and marker.',
    2, 4, 9.500,
    (SELECT id FROM categories WHERE slug = 'car-shop'),
    ARRAY['fine_motor','colors_shapes','problem_solving']::skill_tag[],
    'parent_child', true, false
  ),
  (
    'car-shop-4-6',
    'باقة محل السيارات ٤-٦ سنوات',
    'Car Shop Bundle (Ages 4-6)',
    'باقة تعليمية مغناطيسية لعمر ٤-٦ سنوات بثيمة محل السيارات. تحتوي على ١٢ لوحة A5، قطع مغناطيسية، دليل الأم، وقلم ماركر.',
    'A magnetic educational bundle for ages 4-6 with a car shop theme. Includes 12 A5 boards, magnetic pieces, parent guide, and marker.',
    4, 6, 9.500,
    (SELECT id FROM categories WHERE slug = 'car-shop'),
    ARRAY['fine_motor','colors_shapes','problem_solving','counting_math']::skill_tag[],
    'parent_child', true, false
  ),
  (
    'car-shop-6-8',
    'باقة محل السيارات ٦-٨ سنوات',
    'Car Shop Bundle (Ages 6-8)',
    'باقة تعليمية مغناطيسية لعمر ٦-٨ سنوات بثيمة محل السيارات. تشمل لوحات متقدمة، واجهة محل، لوحة open/close، عملات للعب، وأكثر.',
    'An advanced magnetic educational bundle for ages 6-8 with a car shop theme. Includes advanced boards, shop front, open/close sign, play money, and more.',
    6, 8, 9.500,
    (SELECT id FROM categories WHERE slug = 'car-shop'),
    ARRAY['fine_motor','letters_language','counting_math','storytelling','creativity']::skill_tag[],
    'peer_group', true, false
  );

-- ============================================================
-- PRODUCT VARIANTS (one variant per product, same price)
-- ============================================================

INSERT INTO product_variants (product_id, sku, price_kwd, attributes)
SELECT id, 'TCN-' || UPPER(slug), price_kwd, '{}'::jsonb
FROM products;

-- ============================================================
-- INVENTORY  (100 units each, 5 sold/reserved as baseline)
-- ============================================================

INSERT INTO inventory (variant_id, quantity_on_hand, quantity_reserved, low_stock_threshold)
SELECT
  pv.id,
  CASE pv.sku
    WHEN 'TCN-FLOWER-SHOP-2-4' THEN 94   -- 100 - 6 sold
    WHEN 'TCN-FLOWER-SHOP-4-6' THEN 98   -- 100 - 2 sold
    WHEN 'TCN-FLOWER-SHOP-6-8' THEN 97   -- 100 - 3 sold
    WHEN 'TCN-CAR-SHOP-2-4'    THEN 99   -- 100 - 1 sold
    WHEN 'TCN-CAR-SHOP-4-6'    THEN 98   -- 100 - 2 sold
    WHEN 'TCN-CAR-SHOP-6-8'    THEN 97   -- 100 - 3 sold
    ELSE 100
  END,
  0,
  10
FROM product_variants pv;

-- ============================================================
-- PROMO CODES  (all 10% discount, no expiry set)
-- ============================================================

INSERT INTO discount_codes (code, type, value, min_order_kwd, is_active) VALUES
  ('TCN10',      'percentage', 0.10, 0, true),
  ('MOM10',      'percentage', 0.10, 0, true),
  ('COFFEE10',   'percentage', 0.10, 0, true),
  ('BLISS10',    'percentage', 0.10, 0, true),
  ('TALA10',     'percentage', 0.10, 0, true),
  ('TWINY10',    'percentage', 0.10, 0, true),
  ('HUDA10',     'percentage', 0.10, 0, true),
  ('LIFE10',     'percentage', 0.10, 0, true),
  ('FAA10',      'percentage', 0.10, 0, true),
  ('DAILY10',    'percentage', 0.10, 0, true),
  ('DOUBLE10',   'percentage', 0.10, 0, true),
  ('PROUD10',    'percentage', 0.10, 0, true),
  ('ROONA10',    'percentage', 0.10, 0, true),
  ('FATMAS10',   'percentage', 0.10, 0, true),
  ('DIARIES10',  'percentage', 0.10, 0, true),
  ('IMOM10',     'percentage', 0.10, 0, true),
  ('YAYA10',     'percentage', 0.10, 0, true),
  ('BEYOND10',   'percentage', 0.10, 0, true),
  ('FASH10',     'percentage', 0.10, 0, true);

-- ============================================================
-- STORE SETTINGS  (update with real business data)
-- ============================================================

INSERT INTO store_settings (key, value) VALUES
  ('business_phone',          '"96550499867"'),
  ('business_instagram',      '"@thecraftynest.kw"'),
  ('business_email',          '"thecraftynest.kw@gmail.com"'),
  ('dispatch_location',       '"الشعب - قطعة ٨ شارع ٨٠"'),
  ('package_cost_kwd',        '4.170'),
  ('delivery_cost_base_kwd',  '2.000')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Update existing settings
UPDATE store_settings SET value = '"96550499867"'  WHERE key = 'whatsapp_number';
UPDATE store_settings SET value = '9.500'           WHERE key = 'free_delivery_threshold';
UPDATE store_settings SET value = '50'              WHERE key = 'cod_max_order_kwd';
UPDATE store_settings SET value = '1.000'           WHERE key = 'cod_fee_kwd';

-- Detailed delivery zones with area-level pricing from areas database
UPDATE store_settings
SET value = '{
  "standard_fee_kwd": 1.500,
  "free_threshold_kwd": 9.500,
  "zones": {
    "capital":           { "name_ar": "العاصمة",       "fee_kwd": 1.500 },
    "hawalli":           { "name_ar": "حولي",           "fee_kwd": 1.500 },
    "farwaniya":         { "name_ar": "الفروانية",      "fee_kwd": 1.500 },
    "mubarak_al_kabeer": { "name_ar": "مبارك الكبير",  "fee_kwd": 1.500 },
    "ahmadi":            { "name_ar": "الأحمدي",        "fee_kwd": 1.500, "exceptions": {
      "صباح الأحمد":        4.000,
      "علي صباح السالم":    3.000
    }},
    "jahra":             { "name_ar": "الجهراء",        "fee_kwd": 1.500, "exceptions": {
      "المطلاع": 4.000
    }}
  }
}'::jsonb
WHERE key = 'delivery_zones';

-- ============================================================
-- PACKAGES CONTENT  (stored as jsonb in store_settings for display)
-- ============================================================

INSERT INTO store_settings (key, value) VALUES
('packages_content', '{
  "flower-shop-2-4": [
    { "name": "أنا أطابق الظل", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أميز بين الكبير والصغير", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أتتبع الخطوط", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا ألون صح", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الأرقام (ورق الشجر)", "type": "لوحة A5", "qty": 1 },
    { "name": "قطع مغناطيسية", "type": "قطعة", "qty": 22 },
    { "name": "دليل الأم", "type": "A6", "qty": 1 },
    { "name": "علبة ألوان شمعية", "type": "ملحق", "qty": 1 },
    { "name": "قلم ماركر", "type": "ملحق", "qty": 1 },
    { "name": "ميل بوكس", "type": "تغليف", "qty": 1 },
    { "name": "كيس", "type": "تغليف", "qty": 1 },
    { "name": "كرت شكراً", "type": "هدية", "qty": 1 },
    { "name": "كرت هدية", "type": "هدية", "qty": 1 },
    { "name": "ستيكر لوجو", "type": "ستيكر", "qty": 1 },
    { "name": "ستيكر مكعب", "type": "ستيكر", "qty": 1 },
    { "name": "ستيكرزات الأنشطة", "type": "ستيكر", "qty": 5 },
    { "name": "أكياس مع سحاب", "type": "تغليف", "qty": 5 }
  ],
  "flower-shop-4-6": [
    { "name": "أنا أطابق الأرقام (الشبك)", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أكتشف الفرق 1", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أكتشف الفرق 2", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أكتشف الفرق 3", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أكتشف الفرق 4", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أعد الأشياء", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أتذكر", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق النص الثاني", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أركب الصورة", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان الأساسية 1", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان الأساسية 2", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان الأساسية 3", "type": "لوحة A5", "qty": 1 },
    { "name": "قطع مغناطيسية", "type": "قطعة", "qty": 44 },
    { "name": "دليل الأم", "type": "A6", "qty": 1 },
    { "name": "قلم ماركر", "type": "ملحق", "qty": 1 },
    { "name": "ميل بوكس", "type": "تغليف", "qty": 1 }
  ],
  "flower-shop-6-8": [
    { "name": "أنا أركب قصة", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أحل المتاهة", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أفرز وأطابق", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الكلمة مع الصورة 1", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الكلمة مع الصورة 2", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان الثانوية 1", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان الثانوية 2", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان الثانوية 3", "type": "لوحة A5", "qty": 1 },
    { "name": "محلي الصغير", "type": "لوحة A5", "qty": 1 },
    { "name": "محلي الصغير - ورقية 1", "type": "لوحة A6", "qty": 1 },
    { "name": "محلي الصغير - ورقية 2", "type": "لوحة A6", "qty": 1 },
    { "name": "محلي الصغير - ورقية 3", "type": "لوحة A6", "qty": 1 },
    { "name": "محلي الصغير - ورقية 4", "type": "لوحة A6", "qty": 1 },
    { "name": "واجهة محل قابلة للوقوف", "type": "لوحة PVC", "qty": 1 },
    { "name": "لوحة open/close", "type": "لوحة", "qty": 1 },
    { "name": "عملات نقدية للعب", "type": "مجموعة ١٢ ورقة", "qty": 1 },
    { "name": "قطع مغناطيسية", "type": "قطعة", "qty": 42 },
    { "name": "دليل الأم", "type": "A6", "qty": 1 },
    { "name": "قلم ماركر", "type": "ملحق", "qty": 1 }
  ],
  "car-shop-2-4": [
    { "name": "أنا أطابق الظل", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أميز بين الكبير والصغير", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أتتبع الخطوط", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا ألون صح", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الاتجاهات", "type": "لوحة A5", "qty": 1 },
    { "name": "قطع مغناطيسية", "type": "قطعة", "qty": 20 },
    { "name": "دليل الأم", "type": "A6", "qty": 1 },
    { "name": "علبة ألوان شمعية", "type": "ملحق", "qty": 1 },
    { "name": "قلم ماركر", "type": "ملحق", "qty": 1 },
    { "name": "ميل بوكس", "type": "تغليف", "qty": 1 }
  ],
  "car-shop-4-6": [
    { "name": "أنا أطابق الأرقام", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أكتشف الفرق 1", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أكتشف الفرق 2", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أكتشف الفرق 3", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أكتشف الفرق 4", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أعد الأشياء", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أتذكر", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق النص الثاني", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أركب الصورة", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان الأساسية 1", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان الأساسية 2", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان الأساسية 3", "type": "لوحة A5", "qty": 1 },
    { "name": "قطع مغناطيسية", "type": "قطعة", "qty": 42 },
    { "name": "دليل الأم", "type": "A6", "qty": 1 },
    { "name": "قلم ماركر", "type": "ملحق", "qty": 1 }
  ],
  "car-shop-6-8": [
    { "name": "أنا أركب قصة", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أحل المتاهة", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أفرز وأطابق", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الكلمة مع الصورة", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان - ورقية 1", "type": "لوحة A6", "qty": 1 },
    { "name": "أنا أطابق الألوان - ورقية 2", "type": "لوحة A6", "qty": 1 },
    { "name": "أنا أطابق الألوان الثانوية 1", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان الثانوية 2", "type": "لوحة A5", "qty": 1 },
    { "name": "أنا أطابق الألوان الثانوية 3", "type": "لوحة A5", "qty": 1 },
    { "name": "محلي الصغير", "type": "لوحة A5", "qty": 1 },
    { "name": "محلي الصغير - ورقية 1", "type": "لوحة A6", "qty": 1 },
    { "name": "محلي الصغير - ورقية 2", "type": "لوحة A6", "qty": 1 },
    { "name": "محلي الصغير - ورقية 3", "type": "لوحة A6", "qty": 1 },
    { "name": "محلي الصغير - ورقية 4", "type": "لوحة A6", "qty": 1 },
    { "name": "واجهة محل قابلة للوقوف", "type": "لوحة PVC", "qty": 1 },
    { "name": "لوحة open/close", "type": "لوحة", "qty": 1 },
    { "name": "عملات نقدية للعب", "type": "مجموعة ١٢ ورقة", "qty": 1 },
    { "name": "قطع مغناطيسية", "type": "قطعة", "qty": 58 },
    { "name": "دليل الأم", "type": "A6", "qty": 1 },
    { "name": "قلم ماركر", "type": "ملحق", "qty": 1 }
  ]
}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
