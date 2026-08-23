# Railway Deploy — Şirin Kids

Bu repo monorepo. Railway'de **3 servis** kurun: Postgres + Backend + Frontend.

## 1) Proje oluştur

1. [railway.app](https://railway.app) → New Project
2. GitHub repo: `omeryilmazbusiness/melik`

## 2) PostgreSQL

1. **+ New** → **Database** → **PostgreSQL**
2. Variables sekmesinde `DATABASE_URL` otomatik oluşur (backend'e referans verilecek)

## 3) Backend servisi

1. **+ New** → **GitHub Repo** → aynı repo
2. Settings:
   - **Root Directory:** `backend`
   - Config: `backend/railway.toml` (otomatik)
3. **Variables** (Variables → Raw Editor veya tek tek):

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<güçlü-rastgele-string>
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<güçlü-şifre>
CORS_ORIGIN=https://<frontend-domain>.up.railway.app
API_BASE_URL=https://<backend-domain>.up.railway.app
UPLOAD_DIR=/data/uploads
```

> `CORS_ORIGIN` ve `API_BASE_URL` için önce public domain generate edin (Settings → Networking → Generate Domain), sonra değişkenleri güncelleyin.

4. **Volume (görseller kalıcı kalsın):**
   - Backend servisi → **Settings** → **Volumes** → **Add Volume**
   - Mount Path: `/data/uploads`
   - Deploy

5. Deploy sonrası **bir kez seed:**
   - Backend → **Settings** → veya CLI:
   ```bash
   railway run --service backend npm run db:seed
   ```
   Migrate her deploy'da `start:prod` ile otomatik çalışır.

6. Health: `https://<backend>.up.railway.app/api/health`

## 4) Frontend servisi

1. **+ New** → **GitHub Repo** → aynı repo
2. Settings:
   - **Root Directory:** `frontend`
3. **Variables:**

```
NEXT_PUBLIC_API_URL=https://<backend-domain>.up.railway.app/api
NEXT_PUBLIC_WHATSAPP_NUMBER=9055XXXXXXXX
```

4. Generate Domain (frontend)
5. Backend `CORS_ORIGIN` değerini frontend URL ile güncelleyin (virgülle birden fazla olabilir)

## 5) Sıra özeti

1. Postgres ekle  
2. Backend deploy + domain + volume `/data/uploads`  
3. Env'leri doldur (`DATABASE_URL` referansı)  
4. Seed çalıştır  
5. Frontend deploy + `NEXT_PUBLIC_API_URL`  
6. Backend `CORS_ORIGIN` = frontend URL  

## Notlar

- Upload'lar `/data/uploads` volume'unda; yeni deploy'da silinmez.
- Admin: `/yonetim` → `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- Custom domain isterseniz her iki servise Settings → Domains'ten ekleyin.
