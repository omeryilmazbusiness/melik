import pool from './pool.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const categories = [
  { name: 'Bebek', slug: 'bebek', icon: '👶', sort_order: 1 },
  { name: 'Kız Çocuk', slug: 'kiz-cocuk', icon: '👧', sort_order: 2 },
  { name: 'Erkek Çocuk', slug: 'erkek-cocuk', icon: '👦', sort_order: 3 },
  { name: 'Outlet', slug: 'outlet', icon: '🏷️', sort_order: 4 },
];

const campaigns = [
  { name: 'Büyük İndirim', slug: 'buyuk-indirim', icon: '🔥', is_highlighted: false, sort_order: 1 },
  { name: 'Okula Dönüş', slug: 'okula-donus', icon: '🎒', is_highlighted: false, sort_order: 2 },
  { name: 'Kampanyalar', slug: 'kampanyalar', icon: '🎉', is_highlighted: true, sort_order: 3 },
  { name: 'Yeni Sezon', slug: 'yeni-sezon', icon: '✨', is_highlighted: false, sort_order: 4 },
  { name: 'Tek Fiyat', slug: 'tek-fiyat', icon: '💰', is_highlighted: false, sort_order: 5 },
];

const banners = [
  {
    title: 'Yazın Son Fırsatları',
    subtitle: 'Sezon sonu indirimlerinde %70\'e varan fırsatlar',
    cta_text: 'ALIŞVERİŞE BAŞLA',
    cta_link: '/#section-firsat_urunler',
    image_url: 'https://picsum.photos/seed/sirin-banner/1200/600',
    badge_text: '1000 TL İndirim',
    sort_order: 1,
  },
];

const promoTiles = [
  { title: '6 Al 5 Öde', subtitle: 'Seçili ürünlerde', image_url: 'https://picsum.photos/seed/promo1/400/240', link: '/#section-yeni_sezon', sort_order: 1 },
  { title: 'Tek Fiyat Fırsatları', subtitle: 'Hepsi 200 TL', image_url: 'https://picsum.photos/seed/promo2/400/240', link: '/#section-tek_fiyat', sort_order: 2 },
  { title: 'Yeni Sezon', subtitle: 'Trend parçalar', image_url: 'https://picsum.photos/seed/promo3/400/240', link: '/#section-yeni_sezon', sort_order: 3 },
  { title: 'Bebek Setleri', subtitle: 'Komple gardırop', image_url: 'https://picsum.photos/seed/promo4/400/240', link: '/#kategori-bebek', sort_order: 4 },
  { title: 'Okula Dönüş', subtitle: 'Okul alışverişi', image_url: 'https://picsum.photos/seed/promo5/400/240', link: '/#kampanya-okula-donus', sort_order: 5 },
];

const productImages = {
  tulum: 'https://picsum.photos/seed/baby-tulum/600/800',
  elbise: 'https://picsum.photos/seed/girl-dress/600/800',
  tshirt: 'https://picsum.photos/seed/boy-tshirt/600/800',
  pantolon: 'https://picsum.photos/seed/kids-pants/600/800',
  mont: 'https://picsum.photos/seed/kids-jacket/600/800',
  set: 'https://picsum.photos/seed/baby-set/600/800',
  salopet: 'https://picsum.photos/seed/kids-salopet/600/800',
};

const defaultSizesBaby = [
  { label: '0-3 Ay', in_stock: true },
  { label: '3-6 Ay', in_stock: true },
  { label: '6-9 Ay', in_stock: true },
  { label: '9-12 Ay', in_stock: true },
  { label: '12-18 Ay', in_stock: true },
  { label: '18-24 Ay', in_stock: false },
];

const defaultSizesKids = [
  { label: '2-3 Yaş', in_stock: true },
  { label: '3-4 Yaş', in_stock: true },
  { label: '4-5 Yaş', in_stock: true },
  { label: '5-6 Yaş', in_stock: true },
  { label: '6-7 Yaş', in_stock: false },
  { label: '7-8 Yaş', in_stock: true },
];

const defaultFeatures = [
  { key: 'Kumaş', value: '%100 Pamuk' },
  { key: 'Yıkama', value: '30°C makinede yıkanabilir' },
  { key: 'Menşei', value: 'Türkiye' },
  { key: 'Sezon', value: '2026 Yaz/Kış' },
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildColorVariants(color, imageUrl) {
  const palette = {
    Mavi: ['https://picsum.photos/seed/color-blue/600/800', 'https://picsum.photos/seed/color-navy/600/800'],
    Pembe: ['https://picsum.photos/seed/color-pink/600/800', 'https://picsum.photos/seed/color-rose/600/800'],
    Yeşil: ['https://picsum.photos/seed/color-green/600/800', 'https://picsum.photos/seed/color-mint/600/800'],
    Krem: ['https://picsum.photos/seed/color-cream/600/800'],
    Lacivert: ['https://picsum.photos/seed/color-navy/600/800'],
    Gri: ['https://picsum.photos/seed/color-gray/600/800'],
    Beyaz: ['https://picsum.photos/seed/color-white/600/800'],
  };
  const extras = palette[color] || [imageUrl];
  return [
    { name: color, image_url: imageUrl },
    ...extras.slice(0, 2).map((url, i) => ({
      name: i === 0 ? `${color} Ton` : 'Ek Renk',
      image_url: url,
    })),
  ];
}

const products = [
  { name: 'Şirin Kids Çiçek Desenli Kız Elbisesi - Pembe', subtitle: 'Fırfırlı Yaka - Yazlık Elbise', price: 549.0, original_price: null, section: 'yeni_sezon', category: 'kiz-cocuk', image: 'elbise', badge: 'Yeni', age_range: '3-6 Yaş', color: 'Pembe', model: 'SK-GEL-001' },
  { name: 'Şirin Kids Oversize Erkek Tişört - Lacivert', subtitle: 'Bisiklet Yaka - Basic Tişört', price: 299.0, original_price: null, section: 'yeni_sezon', category: 'erkek-cocuk', image: 'tshirt', badge: 'Yeni', age_range: '6-10 Yaş', color: 'Lacivert', model: 'SK-ET-002' },
  { name: 'Şirin Baby Organik Pamuk Tulum - Krem', subtitle: 'Düğmeli Yaka - Bebek Tulum', price: 399.0, original_price: null, section: 'yeni_sezon', category: 'bebek', image: 'tulum', badge: 'Yeni Sezon', age_range: '0-6 Ay', color: 'Krem', model: 'SK-BT-003' },
  { name: 'Şirin Kids Kapitone Mont - Antrasit', subtitle: 'Kapüşonlu - Kış Montu', price: 899.0, original_price: null, section: 'yeni_sezon', category: 'erkek-cocuk', image: 'mont', badge: null, age_range: '4-8 Yaş', color: 'Gri', model: 'SK-KM-004' },
  { name: 'Şirin Kids Denim Salopet - Mavi', subtitle: 'Ayarlanabilir Askı - Salopet', price: 449.0, original_price: null, section: 'yeni_sezon', category: 'kiz-cocuk', image: 'salopet', badge: 'Trend', age_range: '2-5 Yaş', color: 'Mavi', model: 'SK-SL-005' },
  { name: 'Şirin Baby 3\'lü Body Seti - Pastel', subtitle: 'Üçlü Set - Bebek Body', price: 349.0, original_price: null, section: 'yeni_sezon', category: 'bebek', image: 'set', badge: null, age_range: '0-12 Ay', color: 'Pembe', model: 'SK-BS-006' },
  { name: 'Şirin Kids Etekli Takım - Mor', subtitle: 'İkili Takım - Etek & Bluz', price: 479.0, original_price: null, section: 'yeni_sezon', category: 'kiz-cocuk', image: 'elbise', badge: 'Yeni Sezon', age_range: '5-8 Yaş', color: 'Pembe', model: 'SK-TK-007' },

  { name: 'Şirin Kids Baskılı Tişört - Turuncu', subtitle: 'Baskılı - Günlük Tişört', price: 179.0, original_price: 349.0, section: 'firsat_urunler', category: 'erkek-cocuk', image: 'tshirt', badge: 'Süper Fiyat', age_range: '4-8 Yaş', color: 'Mavi', model: 'SK-FT-008' },
  { name: 'Şirin Baby Fermuarlı Tulum - Yeşil', subtitle: 'Fermuarlı - Polar Tulum', price: 249.0, original_price: 449.0, section: 'firsat_urunler', category: 'bebek', image: 'tulum', badge: 'Süper Fiyat', age_range: '6-12 Ay', color: 'Yeşil', model: 'SK-FT-009' },
  { name: 'Şirin Kids Kapüşonlu Sweatshirt - Gri', subtitle: 'Kapüşonlu - Sweatshirt', price: 299.0, original_price: 549.0, section: 'firsat_urunler', category: 'erkek-cocuk', image: 'mont', badge: 'Günün Fırsatı', age_range: '6-12 Yaş', color: 'Gri', model: 'SK-FS-010' },
  { name: 'Şirin Kids Çiçekli Elbise - Sarı', subtitle: 'Çiçek Desenli - Yaz Elbisesi', price: 219.0, original_price: 399.0, section: 'firsat_urunler', category: 'kiz-cocuk', image: 'elbise', badge: 'Süper Fiyat', age_range: '3-6 Yaş', color: 'Pembe', model: 'SK-FE-011' },
  { name: 'Şirin Kids Jogger Pantolon - Siyah', subtitle: 'Rahat Kesim - Jogger', price: 199.0, original_price: 379.0, section: 'firsat_urunler', category: 'erkek-cocuk', image: 'pantolon', badge: null, age_range: '5-10 Yaş', color: 'Lacivert', model: 'SK-FP-012' },
  { name: 'Şirin Baby 5\'li Çorap Seti', subtitle: 'Bebek Çorap Seti', price: 89.0, original_price: 149.0, section: 'firsat_urunler', category: 'bebek', image: 'set', badge: 'Günün Fırsatı', age_range: '0-2 Yaş', color: 'Krem', model: 'SK-FC-013' },
  { name: 'Şirin Kids Yazlık Şort - Mavi', subtitle: 'Bel Lastikli - Yaz Şortu', price: 149.0, original_price: 279.0, section: 'firsat_urunler', category: 'erkek-cocuk', image: 'pantolon', badge: null, age_range: '3-7 Yaş', color: 'Mavi', model: 'SK-FS-014' },

  { name: 'Şirin Baby Dinozor Nakışlı Tulum - Haki', subtitle: 'Gömlek Yaka - Polo Tulum', price: 200.0, original_price: 349.0, section: 'tek_fiyat', category: 'bebek', image: 'tulum', badge: null, age_range: '6-18 Ay', color: 'Yeşil', model: 'SK-TT-015' },
  { name: 'Şirin Kids Basic Tişört - Beyaz', subtitle: 'Basic - Günlük Tişört', price: 200.0, original_price: 299.0, section: 'tek_fiyat', category: 'erkek-cocuk', image: 'tshirt', badge: null, age_range: '4-10 Yaş', color: 'Beyaz', model: 'SK-TT-016' },
  { name: 'Şirin Kids Puantiyeli Elbise - Kırmızı', subtitle: 'Puantiyeli - Elbise', price: 200.0, original_price: 449.0, section: 'tek_fiyat', category: 'kiz-cocuk', image: 'elbise', badge: null, age_range: '2-5 Yaş', color: 'Pembe', model: 'SK-TT-017' },
  { name: 'Şirin Baby Polar Tulum - Gri', subtitle: 'Polar - Kış Tulumu', price: 200.0, original_price: 379.0, section: 'tek_fiyat', category: 'bebek', image: 'tulum', badge: null, age_range: '0-9 Ay', color: 'Gri', model: 'SK-TT-018' },
  { name: 'Şirin Kids Eşofman Altı - Lacivert', subtitle: 'Bel Lastikli - Eşofman', price: 200.0, original_price: 329.0, section: 'tek_fiyat', category: 'erkek-cocuk', image: 'pantolon', badge: null, age_range: '6-12 Yaş', color: 'Lacivert', model: 'SK-TT-019' },
  { name: 'Şirin Kids Salopet Elbise - Yeşil', subtitle: 'Salopet - Elbise', price: 200.0, original_price: 399.0, section: 'tek_fiyat', category: 'kiz-cocuk', image: 'salopet', badge: null, age_range: '3-6 Yaş', color: 'Yeşil', model: 'SK-TT-020' },
  { name: 'Şirin Baby 2\'li Pijama Seti', subtitle: 'İkili Pijama Seti', price: 200.0, original_price: 349.0, section: 'tek_fiyat', category: 'bebek', image: 'set', badge: null, age_range: '12-24 Ay', color: 'Mavi', model: 'SK-TT-021' },
];

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE products, categories, banners, campaigns, promo_tiles RESTART IDENTITY CASCADE');

    const categoryMap = {};
    for (const cat of categories) {
      const result = await client.query(
        `INSERT INTO categories (name, slug, icon, sort_order) VALUES ($1, $2, $3, $4) RETURNING id, slug`,
        [cat.name, cat.slug, cat.icon, cat.sort_order]
      );
      categoryMap[result.rows[0].slug] = result.rows[0].id;
    }

    for (const camp of campaigns) {
      await client.query(
        `INSERT INTO campaigns (name, slug, icon, is_highlighted, sort_order) VALUES ($1, $2, $3, $4, $5)`,
        [camp.name, camp.slug, camp.icon, camp.is_highlighted, camp.sort_order]
      );
    }

    for (const banner of banners) {
      await client.query(
        `INSERT INTO banners (title, subtitle, cta_text, cta_link, image_url, badge_text, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [banner.title, banner.subtitle, banner.cta_text, banner.cta_link, banner.image_url, banner.badge_text, banner.sort_order]
      );
    }

    for (const tile of promoTiles) {
      await client.query(
        `INSERT INTO promo_tiles (title, subtitle, image_url, link, sort_order) VALUES ($1, $2, $3, $4, $5)`,
        [tile.title, tile.subtitle, tile.image_url, tile.link, tile.sort_order]
      );
    }

    for (const product of products) {
      const discountPercent = product.original_price
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : null;
      const slug = slugify(product.name);
      const imageUrl = productImages[product.image];
      const images = JSON.stringify([
        imageUrl,
        `https://picsum.photos/seed/${slug}-2/600/800`,
        `https://picsum.photos/seed/${slug}-3/600/800`,
      ]);
      const sizes = JSON.stringify(product.category === 'bebek' ? defaultSizesBaby : defaultSizesKids);
      const colorVariants = JSON.stringify(buildColorVariants(product.color, imageUrl));
      const features = JSON.stringify(defaultFeatures);
      const detail = `${product.name}, Şirin Kids kalitesiyle üretilmiştir. Yumuşak dokusu sayesinde bebeğinizin hassas cildine uyumludur. Nefes alabilir kumaş yapısı ile gün boyu konfor sağlar.`;

      await client.query(
        `INSERT INTO products (
          name, slug, subtitle, description, detail, price, original_price, discount_percent,
          section, category_id, image_url, images, badge, age_range, color, brand, model,
          sizes, color_variants, features, is_featured
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
        [
          product.name,
          slug,
          product.subtitle,
          detail,
          detail,
          product.price,
          product.original_price,
          discountPercent,
          product.section,
          categoryMap[product.category],
          imageUrl,
          images,
          product.badge,
          product.age_range,
          product.color,
          'Şirin Kids',
          product.model,
          sizes,
          colorVariants,
          features,
          product.section === 'yeni_sezon',
        ]
      );
    }

    await client.query('COMMIT');
    console.log('✓ Database seeded successfully');
    console.log(`  - ${categories.length} categories`);
    console.log(`  - ${products.length} products`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await seedAdmin();
  await pool.end();
}

async function seedAdmin() {
  const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'SirinKids2026!';
  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO admins (username, password_hash, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
    [username, hash, 'Şirin Kids Admin']
  );
  console.log(`✓ Admin user ready (${username})`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
