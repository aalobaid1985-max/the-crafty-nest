-- ============================================================
-- The Crafty Nest — Initial Schema Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE kuwait_governorate AS ENUM (
  'capital',
  'hawalli',
  'farwaniya',
  'ahmadi',
  'jahra',
  'mubarak_al_kabeer'
);

CREATE TYPE interaction_type AS ENUM (
  'solo',
  'parent_child',
  'peer_group'
);

CREATE TYPE skill_tag AS ENUM (
  'fine_motor',
  'gross_motor',
  'creativity',
  'counting_math',
  'letters_language',
  'colors_shapes',
  'problem_solving',
  'social_emotional',
  'science_stem',
  'storytelling'
);

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'unpaid',
  'paid',
  'failed',
  'refunded'
);

CREATE TYPE payment_method AS ENUM (
  'knet',
  'visa',
  'mastercard',
  'cod'
);

CREATE TYPE payment_gateway AS ENUM (
  'myfatoorah',
  'cod'
);

CREATE TYPE transaction_status AS ENUM (
  'initiated',
  'paid',
  'failed',
  'refunded'
);

CREATE TYPE shipment_carrier AS ENUM (
  'aramex',
  'self_delivery',
  'customer_pickup'
);

CREATE TYPE shipment_status AS ENUM (
  'label_created',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'failed'
);

CREATE TYPE inventory_movement_type AS ENUM (
  'purchase',
  'sale',
  'return',
  'adjustment',
  'damage'
);

CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed_kwd',
  'free_shipping'
);

CREATE TYPE user_role AS ENUM (
  'customer',
  'admin',
  'inventory_staff',
  'delivery_staff'
);

CREATE TYPE maintenance_trigger AS ENUM (
  'calendar',
  'usage_count',
  'area_based',
  'one_time'
);

CREATE TYPE delivery_slot AS ENUM (
  '09:00-12:00',
  '12:00-15:00',
  '15:00-18:00',
  '18:00-21:00'
);

-- ============================================================
-- CUSTOMERS & AUTH
-- ============================================================

CREATE TABLE customers (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id       uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name_ar       text,
  name_en       text,
  phone         text UNIQUE NOT NULL,
  civil_id      text,
  role          user_role NOT NULL DEFAULT 'customer',
  preferred_lang text NOT NULL DEFAULT 'ar' CHECK (preferred_lang IN ('ar', 'en')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE addresses (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label         text,
  governorate   kuwait_governorate NOT NULL,
  area          text NOT NULL,
  block         text NOT NULL,
  street        text NOT NULL,
  building      text NOT NULL,
  floor         text,
  apartment     text,
  is_default    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Only one default address per customer
CREATE UNIQUE INDEX addresses_one_default_per_customer
  ON addresses (customer_id)
  WHERE is_default = true;

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          text UNIQUE NOT NULL,
  name_ar       text NOT NULL,
  name_en       text NOT NULL,
  parent_id     uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PRODUCTS & VARIANTS
-- ============================================================

CREATE TABLE products (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                text UNIQUE NOT NULL,
  name_ar             text NOT NULL,
  name_en             text NOT NULL,
  description_ar      text,
  description_en      text,
  age_min             int NOT NULL CHECK (age_min >= 2),
  age_max             int NOT NULL CHECK (age_max <= 8 AND age_max >= age_min),
  price_kwd           numeric(8,3) NOT NULL CHECK (price_kwd > 0),
  compare_price_kwd   numeric(8,3) CHECK (compare_price_kwd > price_kwd),
  category_id         uuid REFERENCES categories(id) ON DELETE SET NULL,
  skill_tags          skill_tag[] NOT NULL DEFAULT '{}',
  interaction_type    interaction_type NOT NULL,
  is_active           boolean NOT NULL DEFAULT true,
  is_featured         boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE product_variants (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku           text UNIQUE NOT NULL,
  name_ar       text,
  name_en       text,
  price_kwd     numeric(8,3) NOT NULL CHECK (price_kwd > 0),
  weight_grams  int,
  attributes    jsonb NOT NULL DEFAULT '{}',
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE product_images (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id    uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  storage_path  text NOT NULL,
  alt_ar        text,
  alt_en        text,
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INVENTORY
-- ============================================================

CREATE TABLE inventory (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id            uuid UNIQUE NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity_on_hand      int NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_reserved     int NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  low_stock_threshold   int NOT NULL DEFAULT 5,
  last_updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Computed available quantity view
CREATE VIEW inventory_available AS
  SELECT
    i.id,
    i.variant_id,
    pv.sku,
    p.name_ar,
    p.name_en,
    i.quantity_on_hand,
    i.quantity_reserved,
    (i.quantity_on_hand - i.quantity_reserved) AS quantity_available,
    i.low_stock_threshold,
    CASE
      WHEN (i.quantity_on_hand - i.quantity_reserved) <= i.low_stock_threshold THEN true
      ELSE false
    END AS is_low_stock
  FROM inventory i
  JOIN product_variants pv ON pv.id = i.variant_id
  JOIN products p ON p.id = pv.product_id;

CREATE TABLE inventory_movements (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id      uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  movement_type   inventory_movement_type NOT NULL,
  quantity_delta  int NOT NULL,
  reference_id    uuid,
  note            text,
  created_by      uuid REFERENCES customers(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- DISCOUNT CODES & GIFT CARDS
-- ============================================================

CREATE TABLE discount_codes (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            text UNIQUE NOT NULL,
  type            discount_type NOT NULL,
  value           numeric(8,3) NOT NULL CHECK (value > 0),
  min_order_kwd   numeric(8,3),
  max_uses        int,
  times_used      int NOT NULL DEFAULT 0,
  valid_from      timestamptz,
  valid_until     timestamptz,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE gift_cards (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                text UNIQUE NOT NULL,
  balance_kwd         numeric(8,3) NOT NULL CHECK (balance_kwd >= 0),
  original_value_kwd  numeric(8,3) NOT NULL CHECK (original_value_kwd > 0),
  purchased_by        uuid REFERENCES customers(id) ON DELETE SET NULL,
  redeemed_by         uuid REFERENCES customers(id) ON DELETE SET NULL,
  expires_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CARTS
-- ============================================================

CREATE TABLE carts (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     uuid REFERENCES customers(id) ON DELETE CASCADE,
  session_token   text UNIQUE,
  discount_code_id uuid REFERENCES discount_codes(id) ON DELETE SET NULL,
  gift_card_id    uuid REFERENCES gift_cards(id) ON DELETE SET NULL,
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id         uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id      uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity        int NOT NULL CHECK (quantity > 0),
  unit_price_kwd  numeric(8,3) NOT NULL,
  added_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cart_id, variant_id)
);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE SEQUENCE order_number_seq START 1;

CREATE TABLE orders (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        text UNIQUE NOT NULL DEFAULT ('TCN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 5, '0')),
  customer_id         uuid REFERENCES customers(id) ON DELETE SET NULL,
  status              order_status NOT NULL DEFAULT 'pending',
  payment_method      payment_method NOT NULL,
  payment_status      payment_status NOT NULL DEFAULT 'unpaid',
  delivery_slot       delivery_slot,
  subtotal_kwd        numeric(8,3) NOT NULL CHECK (subtotal_kwd >= 0),
  discount_kwd        numeric(8,3) NOT NULL DEFAULT 0 CHECK (discount_kwd >= 0),
  delivery_fee_kwd    numeric(8,3) NOT NULL DEFAULT 0 CHECK (delivery_fee_kwd >= 0),
  cod_fee_kwd         numeric(8,3) NOT NULL DEFAULT 0 CHECK (cod_fee_kwd >= 0),
  gift_card_applied_kwd numeric(8,3) NOT NULL DEFAULT 0 CHECK (gift_card_applied_kwd >= 0),
  total_kwd           numeric(8,3) NOT NULL CHECK (total_kwd >= 0),
  currency            text NOT NULL DEFAULT 'KWD',
  notes               text,
  address_snapshot    jsonb NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id        uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_snapshot  jsonb NOT NULL,
  quantity          int NOT NULL CHECK (quantity > 0),
  unit_price_kwd    numeric(8,3) NOT NULL,
  total_kwd         numeric(8,3) NOT NULL
);

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payment_transactions (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gateway               payment_gateway NOT NULL,
  gateway_invoice_id    text,
  gateway_payment_id    text,
  payment_method_detail text,
  amount_kwd            numeric(8,3) NOT NULL,
  status                transaction_status NOT NULL DEFAULT 'initiated',
  raw_response          jsonb,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- SHIPMENTS
-- ============================================================

CREATE TABLE shipments (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier               shipment_carrier NOT NULL DEFAULT 'aramex',
  tracking_number       text,
  status                shipment_status NOT NULL DEFAULT 'label_created',
  estimated_delivery    date,
  actual_delivery       timestamptz,
  carrier_response      jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE product_reviews (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id   uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body_ar       text,
  body_en       text,
  is_approved   boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, order_id, product_id)
);

-- ============================================================
-- WISHLISTS
-- ============================================================

CREATE TABLE wishlists (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  variant_id    uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  added_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, variant_id)
);

-- ============================================================
-- STORE SETTINGS
-- ============================================================

CREATE TABLE store_settings (
  key           text PRIMARY KEY,
  value         jsonb NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Seed default settings
INSERT INTO store_settings (key, value) VALUES
  ('whatsapp_number',         '"96512345678"'),
  ('cod_max_order_kwd',       '50'),
  ('cod_fee_kwd',             '1.000'),
  ('free_delivery_threshold', '15.000'),
  ('same_day_cutoff_hour',    '13'),
  ('delivery_zones', '{
    "zone_1": { "governorates": ["capital", "hawalli"], "fee_kwd": 1.000, "same_day": true },
    "zone_2": { "governorates": ["farwaniya", "mubarak_al_kabeer"], "fee_kwd": 1.500, "same_day": true },
    "zone_3": { "governorates": ["ahmadi", "jahra"], "fee_kwd": 2.000, "same_day": false }
  }');

-- ============================================================
-- INDEXES
-- ============================================================

-- Products
CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX products_age_range_idx ON products(age_min, age_max);
CREATE INDEX products_is_active_idx ON products(is_active);
CREATE INDEX products_is_featured_idx ON products(is_featured);
CREATE INDEX products_slug_idx ON products(slug);

-- Full-text search on product names
CREATE INDEX products_name_ar_trgm_idx ON products USING GIN (name_ar gin_trgm_ops);
CREATE INDEX products_name_en_trgm_idx ON products USING GIN (name_en gin_trgm_ops);

-- Orders
CREATE INDEX orders_customer_id_idx ON orders(customer_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_created_at_idx ON orders(created_at DESC);

-- Inventory movements
CREATE INDEX inventory_movements_variant_id_idx ON inventory_movements(variant_id);
CREATE INDEX inventory_movements_created_at_idx ON inventory_movements(created_at DESC);

-- Carts
CREATE INDEX carts_customer_id_idx ON carts(customer_id);
CREATE INDEX carts_session_token_idx ON carts(session_token);

-- Shipments
CREATE INDEX shipments_order_id_idx ON shipments(order_id);
CREATE INDEX shipments_tracking_number_idx ON shipments(tracking_number);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews     ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists           ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings      ENABLE ROW LEVEL SECURITY;

-- Helper: get current customer's role
CREATE OR REPLACE FUNCTION current_customer_role()
RETURNS user_role AS $$
  SELECT role FROM customers WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current customer's id
CREATE OR REPLACE FUNCTION current_customer_id()
RETURNS uuid AS $$
  SELECT id FROM customers WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT current_customer_role() = 'admin'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is current user admin or inventory_staff?
CREATE OR REPLACE FUNCTION is_inventory_staff()
RETURNS boolean AS $$
  SELECT current_customer_role() IN ('admin', 'inventory_staff')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is current user admin or delivery_staff?
CREATE OR REPLACE FUNCTION is_delivery_staff()
RETURNS boolean AS $$
  SELECT current_customer_role() IN ('admin', 'delivery_staff')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- customers ----
CREATE POLICY "customers: own row" ON customers
  FOR ALL USING (auth_id = auth.uid());
CREATE POLICY "customers: admin all" ON customers
  FOR ALL USING (is_admin());

-- ---- addresses ----
CREATE POLICY "addresses: own" ON addresses
  FOR ALL USING (customer_id = current_customer_id());
CREATE POLICY "addresses: admin all" ON addresses
  FOR ALL USING (is_admin());

-- ---- products ----
CREATE POLICY "products: public read active" ON products
  FOR SELECT USING (is_active = true);
CREATE POLICY "products: admin all" ON products
  FOR ALL USING (is_admin());

-- ---- product_variants ----
CREATE POLICY "product_variants: public read active" ON product_variants
  FOR SELECT USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_active = true)
  );
CREATE POLICY "product_variants: admin all" ON product_variants
  FOR ALL USING (is_admin());

-- ---- product_images ----
CREATE POLICY "product_images: public read" ON product_images
  FOR SELECT USING (true);
CREATE POLICY "product_images: admin all" ON product_images
  FOR ALL USING (is_admin());

-- ---- categories ----
CREATE POLICY "categories: public read" ON categories
  FOR SELECT USING (true);
CREATE POLICY "categories: admin all" ON categories
  FOR ALL USING (is_admin());

-- ---- inventory ----
CREATE POLICY "inventory: staff read" ON inventory
  FOR SELECT USING (is_inventory_staff());
CREATE POLICY "inventory: staff write" ON inventory
  FOR ALL USING (is_inventory_staff());

-- ---- inventory_movements ----
CREATE POLICY "inventory_movements: staff all" ON inventory_movements
  FOR ALL USING (is_inventory_staff());

-- ---- discount_codes ----
CREATE POLICY "discount_codes: admin all" ON discount_codes
  FOR ALL USING (is_admin());
CREATE POLICY "discount_codes: customer read active" ON discount_codes
  FOR SELECT USING (is_active = true);

-- ---- gift_cards ----
CREATE POLICY "gift_cards: own purchased" ON gift_cards
  FOR SELECT USING (purchased_by = current_customer_id() OR redeemed_by = current_customer_id());
CREATE POLICY "gift_cards: admin all" ON gift_cards
  FOR ALL USING (is_admin());

-- ---- carts ----
CREATE POLICY "carts: own" ON carts
  FOR ALL USING (customer_id = current_customer_id() OR customer_id IS NULL);
CREATE POLICY "carts: admin all" ON carts
  FOR ALL USING (is_admin());

-- ---- cart_items ----
CREATE POLICY "cart_items: own via cart" ON cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carts c
      WHERE c.id = cart_id
        AND (c.customer_id = current_customer_id() OR c.customer_id IS NULL)
    )
  );

-- ---- orders ----
CREATE POLICY "orders: own" ON orders
  FOR SELECT USING (customer_id = current_customer_id());
CREATE POLICY "orders: admin all" ON orders
  FOR ALL USING (is_admin());
CREATE POLICY "orders: inventory staff read" ON orders
  FOR SELECT USING (is_inventory_staff());
CREATE POLICY "orders: delivery staff read" ON orders
  FOR SELECT USING (is_delivery_staff());
CREATE POLICY "orders: delivery staff update status" ON orders
  FOR UPDATE USING (is_delivery_staff());

-- ---- order_items ----
CREATE POLICY "order_items: own via order" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.customer_id = current_customer_id()
    )
  );
CREATE POLICY "order_items: admin all" ON order_items
  FOR ALL USING (is_admin());

-- ---- payment_transactions ----
CREATE POLICY "payment_transactions: own via order" ON payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.customer_id = current_customer_id()
    )
  );
CREATE POLICY "payment_transactions: admin all" ON payment_transactions
  FOR ALL USING (is_admin());

-- ---- shipments ----
CREATE POLICY "shipments: customer read own" ON shipments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.customer_id = current_customer_id()
    )
  );
CREATE POLICY "shipments: delivery staff all" ON shipments
  FOR ALL USING (is_delivery_staff());
CREATE POLICY "shipments: admin all" ON shipments
  FOR ALL USING (is_admin());

-- ---- product_reviews ----
CREATE POLICY "product_reviews: public read approved" ON product_reviews
  FOR SELECT USING (is_approved = true);
CREATE POLICY "product_reviews: customer insert own" ON product_reviews
  FOR INSERT WITH CHECK (customer_id = current_customer_id());
CREATE POLICY "product_reviews: admin all" ON product_reviews
  FOR ALL USING (is_admin());

-- ---- wishlists ----
CREATE POLICY "wishlists: own" ON wishlists
  FOR ALL USING (customer_id = current_customer_id());

-- ---- store_settings ----
CREATE POLICY "store_settings: admin all" ON store_settings
  FOR ALL USING (is_admin());
CREATE POLICY "store_settings: public read" ON store_settings
  FOR SELECT USING (true);

-- ============================================================
-- SAMPLE SEED DATA (optional — remove before production)
-- ============================================================

-- Categories
INSERT INTO categories (slug, name_ar, name_en, sort_order) VALUES
  ('starter-kits',  'مجموعات البداية',  'Starter Kits',  1),
  ('explorer-kits', 'مجموعات الاستكشاف', 'Explorer Kits', 2),
  ('builder-kits',  'مجموعات البناء',    'Builder Kits',  3),
  ('bundles',       'الحزم',             'Bundles',        4);
