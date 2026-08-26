-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Categories for navigation
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(10),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product collection types
DO $$ BEGIN
  CREATE TYPE product_section AS ENUM ('yeni_sezon', 'firsat_urunler', 'tek_fiyat');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percent INT,
  section product_section,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  image_url VARCHAR(500) NOT NULL,
  images JSONB DEFAULT '[]',
  rating DECIMAL(2, 1) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  badge VARCHAR(50),
  age_range VARCHAR(50),
  color VARCHAR(50),
  subtitle VARCHAR(255),
  brand VARCHAR(100) DEFAULT 'Şirin Kids',
  model VARCHAR(100),
  sizes JSONB DEFAULT '[]',
  color_variants JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  detail TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_section ON products(section);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Uploaded images (banner/product) — survives container redeploys
CREATE TABLE IF NOT EXISTS uploaded_files (
  filename VARCHAR(255) PRIMARY KEY,
  mime_type VARCHAR(100) NOT NULL,
  data BYTEA NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  cta_text VARCHAR(100),
  cta_link VARCHAR(255),
  image_url VARCHAR(500),
  badge_text VARCHAR(100),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign links (secondary nav)
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(10),
  is_highlighted BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

-- Promo tiles (small carousel below hero)
CREATE TABLE IF NOT EXISTS promo_tiles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  subtitle VARCHAR(150),
  image_url VARCHAR(500),
  link VARCHAR(255),
  sort_order INT DEFAULT 0
);
