# ITR Filing App 📋

## Setup Steps

### 1. Dependencies install karo
```bash
npm install
```

### 2. .env file banao
```bash
cp .env.example .env
# Apna Neon DB URL .env mein paste karo
```

### 3. Prisma setup karo
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. App run karo
```bash
npm run dev
```

### 5. Browser mein kholo
http://localhost:3000

---

## Pages

| Page | URL | Kaam |
|------|-----|------|
| Home | / | Landing page |
| Dashboard | /dashboard | Tax summary |
| Income | /income | Income sources add karo |
| Expenses | /expenses | Business expenses (ITR-4) |
| Investments | /investments | 80C, 80D deductions |
| TDS | /tds | Form 16 / 26AS data |
| Calculator | /calculator | Old vs New regime compare |
| Report | /report | ITR ready summary |

## Tech Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Prisma v7
- Neon PostgreSQL
