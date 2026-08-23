# Şirin Kids — Çocuk Giyim E-Ticaret

Modern, minimalist ve premium çocuk giyim e-ticaret platformu. Express.js backend, Next.js frontend, PostgreSQL ve JWT korumalı yönetim paneli.

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4, TypeScript |
| Backend | Express.js, Node.js (ES Modules), JWT, Multer |
| Veritabanı | PostgreSQL 16 |
| Altyapı | Docker Compose |

## Özellikler

- **Filtreli arama** — Kategori, koleksiyon ve fiyat filtresi
- **Kategori sayfaları** — Header kategorilerine tıklayınca ürün kart grid
- **Ürün detay** — Beden/renk seçimi, WhatsApp ile satın al
- **3 koleksiyon** — Yeni Sezon, Fırsat Ürünler, Tek Fiyat
- **Hero banner** — Yönetimden görsel yükleme (1200×800), carousel
- **Yönetim paneli** (`/yonetim`) — Ürün, kategori, kampanya, banner CRUD
- **JWT auth** — Bcrypt hash’li admin hesabı

## Hızlı Başlangıç

### Gereksinimler

- Node.js 20+
- Docker & Docker Compose

### Kurulum

```bash
# 1. PostgreSQL (varsayılan host port: 15432)
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run db:setup       # migrate + seed + admin

# 3. Frontend
cd ../frontend
cp .env.local.example .env.local
npm install

# 4. Çalıştır
cd ../backend && npm run dev    # http://localhost:4000
cd ../frontend && npm run dev   # http://localhost:3000
```

## Yönetim Paneli

| | |
|---|---|
| URL | http://localhost:3000/yonetim |
| Kullanıcı | `admin` (`.env` → `ADMIN_USERNAME`) |
| Şifre | `.env` → `ADMIN_PASSWORD` (ör. `SirinKids2026!`) |

**Panel menüsü:** Ürünler · Bannerlar · Kategoriler · Kampanyalar

Banner önerilen ölçü: **1200 × 800 px** (oran 3:2)

## Public API

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/health` | Sağlık |
| GET | `/api/categories` | Kategoriler |
| GET | `/api/products` | Ürünler (`?category=&section=`) |
| GET | `/api/products/sections` | Koleksiyonlar |
| GET | `/api/products/:slug` | Ürün detay |
| GET | `/api/search` | Arama |
| GET | `/api/banners` | Aktif bannerlar |
| GET | `/api/campaigns` | Kampanyalar |

## Admin API (Bearer JWT)

| Method | Endpoint |
|--------|----------|
| POST | `/api/admin/auth/login` |
| GET | `/api/admin/auth/me` |
| CRUD | `/api/admin/products` |
| CRUD | `/api/admin/categories` |
| CRUD | `/api/admin/campaigns` |
| CRUD | `/api/admin/banners` |
| POST | `/api/admin/upload` |

## Ortam Değişkenleri

**Backend** (`backend/.env`):

```
PORT=4000
DATABASE_URL=postgresql://melik:melik_dev_password@localhost:15432/melik_store
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SirinKids2026!
API_BASE_URL=http://localhost:4000
```

**Frontend** (`frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WHATSAPP_NUMBER=905551234567
```

## Proje Yapısı

```
melik/
├── backend/src/
│   ├── db/           # schema, migrate, seed
│   ├── middleware/   # JWT auth
│   ├── routes/       # public + admin API
│   └── uploads/      # yüklenen görseller
├── frontend/src/
│   ├── app/          # sayfalar (/, /urun, /kategori, /yonetim)
│   ├── components/   # UI
│   └── lib/          # api, types, whatsapp
└── docker-compose.yml
```

## Lisans

Private — Şirin Kids © 2026

## Deploy

Railway adımları için bkz. [RAILWAY.md](./RAILWAY.md)
