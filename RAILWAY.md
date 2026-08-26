# Railway Deploy — Tek Servis + Database

Şirin Kids monorepo **tek uygulama servisi** + **PostgreSQL** olarak deploy edilir.
Frontend (Next.js) ve Backend (Express) aynı process / aynı domain üzerinden çalışır.

## Kurulum

### 1) New Project
- [railway.app](https://railway.app) → **New Project**
- **Deploy from GitHub** → `omeryilmazbusiness/melik`

### 2) PostgreSQL
- **+ New** → **Database** → **PostgreSQL**

### 3) Web servisi (tek service)
Repo zaten eklendiyse Settings:

| Ayar | Değer |
|------|--------|
| Root Directory | `/` (boş / repo kökü) |
| Build | `npm run railway:build` (`railway.toml`) |
| Start | `npm run railway:start` |

**Networking → Generate Domain** (ör. `sirin-kids-production.up.railway.app`)

**Volumes → Add Volume** (önerilir, performans için)
- Mount Path: `/data/uploads`

> Banner/ürün görselleri Postgres `uploaded_files` tablosuna da kaydedilir.
> Volume olmasa bile redeploy sonrası görseller DB’den geri servis edilir.

### 4) Environment Variables

Web servisine şunları ekleyin:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<güçlü-rastgele-secret>
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<güçlü-şifre>
UPLOAD_DIR=/data/uploads
CORS_ORIGIN=https://<sizin-domain>.up.railway.app
API_BASE_URL=https://<sizin-domain>.up.railway.app
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_WHATSAPP_NUMBER=9055XXXXXXXX
```

> `CORS_ORIGIN` ve `API_BASE_URL` = Generate Domain ile aldığınız URL (https ile, sonda slash yok).
> `NEXT_PUBLIC_API_URL=/api` — aynı origin; build sırasında da kullanılır (`railway:build`).

`DATABASE_URL` için Railway Variable Reference:
`Variables` → `DATABASE_URL` → **Add Reference** → Postgres → `DATABASE_URL`

### 5) Deploy & Seed

Deploy bittikten sonra **bir kez** seed:

```bash
# Railway CLI
railway link
railway run npm run db:seed
```

veya Dashboard → Web servisi → **Shell** / one-off:
```
npm run db:seed
```

Migrate her start’ta otomatik çalışır.

### 6) Kontrol

| URL | Beklenen |
|-----|----------|
| `https://<domain>/api/health` | `{"status":"ok"}` |
| `https://<domain>/` | Anasayfa |
| `https://<domain>/yonetim` | Admin paneli |

## Özet mimari

```
Browser  →  https://domain/
              ├── /api/*      → Express
              ├── /uploads/*  → disk (/data/uploads volume)
              └── /*          → Next.js
```

## Local geliştirme (değişmedi)

```bash
docker compose up -d
cd backend && npm run db:setup && npm run dev   # :4000
cd frontend && npm run dev                        # :3000
```
