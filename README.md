# Mitra Event

Next.js + Prisma + PostgreSQL tabanli etkinlik ve icerik yonetim projesi.

## 1. Ortam Degiskenleri

`.env.example` dosyasini kopyalayip `.env` olusturun ve `DATABASE_URL` degerini doldurun.

## 2. Veritabani Hazirlama

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

Not: `db:seed`, mevcut `data/*.json` verilerini PostgreSQL'e tasir.

## 3. Gelistirme

```bash
npm run dev
```

## 4. Production / Deploy

Deploy sonrasi migration uygulamak icin:

```bash
npm run prisma:migrate
```

Ardindan uygulamayi calistirin:

```bash
npm run build
npm run start
```
