-- Naffy Scents — D1 schema (generated from base44/entities/*.jsonc)
-- Whole naira amounts (REAL). Booleans are INTEGER 0/1. JSON arrays stored as TEXT.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mfa_secrets (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  secret TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  short_description TEXT,
  description TEXT,
  price REAL NOT NULL,
  compare_at_price REAL NOT NULL DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('For Her','For Him','Unisex','Signature')),
  gender TEXT CHECK (gender IN ('Women','Men','Unisex')),
  fragrance_family TEXT CHECK (fragrance_family IN ('Fresh','Sweet','Woody','Floral','Oud','Spicy','Citrus','Musky')),
  top_notes TEXT,
  heart_notes TEXT,
  base_notes TEXT,
  size_ml INTEGER NOT NULL DEFAULT 100,
  images TEXT NOT NULL DEFAULT '[]',
  stock INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  bestseller INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 5,
  review_count INTEGER NOT NULL DEFAULT 0,
  occasions TEXT NOT NULL DEFAULT '[]',
  intensity TEXT CHECK (intensity IN ('Light','Moderate','Intense')),
  moods TEXT NOT NULL DEFAULT '[]',
  available INTEGER NOT NULL DEFAULT 1,
  is_bundle INTEGER NOT NULL DEFAULT 0,
  bundle_items TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  items TEXT NOT NULL DEFAULT '[]',
  fulfilment_method TEXT NOT NULL DEFAULT 'Logistics Delivery' CHECK (fulfilment_method IN ('Pickup','Logistics Delivery')),
  subtotal REAL NOT NULL DEFAULT 0,
  delivery_fee REAL NOT NULL DEFAULT 0,
  delivery_fee_min REAL NOT NULL DEFAULT 0,
  delivery_fee_max REAL NOT NULL DEFAULT 0,
  delivery_info_note TEXT,
  discount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Awaiting Payment Confirmation' CHECK (status IN ('Awaiting Payment Confirmation','Confirmed','Picked Up','Delivered','Canceled')),
  payment_status TEXT NOT NULL DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid','Paid','Pending')),
  payment_reference TEXT,
  payment_confirmation_submitted INTEGER NOT NULL DEFAULT 0,
  payment_confirmation_date TEXT,
  coupon_code TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  customer_name TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  review TEXT NOT NULL,
  location TEXT,
  order_number TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  approved INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  discount_value REAL NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  banner_image TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY,
  whatsapp_number TEXT NOT NULL DEFAULT '2348012345678',
  contact_email TEXT,
  instagram_handle TEXT DEFAULT 'naffyscents',
  snapchat_handle TEXT DEFAULT 'naffyscents',
  tiktok_handle TEXT DEFAULT 'naffyscents',
  facebook_handle TEXT,
  store_address TEXT DEFAULT 'Ilaro, Ogun State, Nigeria',
  maps_url TEXT,
  business_hours TEXT,
  pickup_hours TEXT DEFAULT '12:00 PM - 5:00 PM',
  logistics_provider TEXT DEFAULT 'Josh Logistics',
  delivery_fee_ilaro_min REAL NOT NULL DEFAULT 1000,
  delivery_fee_ilaro_max REAL NOT NULL DEFAULT 2000,
  delivery_info_note TEXT,
  delivery_fee_lagos REAL NOT NULL DEFAULT 2500,
  delivery_fee_nationwide REAL NOT NULL DEFAULT 4500,
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  payment_instructions TEXT,
  hero_headline TEXT DEFAULT 'SCENT THAT SPEAKS BEFORE YOU DO.',
  hero_subtext TEXT,
  promo_text TEXT DEFAULT 'YOUR SIGNATURE SCENT AWAITS.',
  newsletter_text TEXT,
  brand_story_heading TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
