ALTER TABLE products ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100) DEFAULT 'Şirin Kids';
ALTER TABLE products ADD COLUMN IF NOT EXISTS model VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS detail TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Kampanya/koleksiyon opsiyonel: seçilmezse NULL
ALTER TABLE products ALTER COLUMN section DROP NOT NULL;

-- Persist uploads in Postgres so redeploys / missing volumes do not lose banner & product images
CREATE TABLE IF NOT EXISTS uploaded_files (
  filename VARCHAR(255) PRIMARY KEY,
  mime_type VARCHAR(100) NOT NULL,
  data BYTEA NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
