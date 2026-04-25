# Only Gadjets – Setup & Deployment Guide

## Step 1: Add Your Supabase Keys

Open `.env.local` and fill in the two missing values:

```
NEXT_PUBLIC_SUPABASE_URL=https://prxtqiifplqevxcvogsr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase Dashboard>
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase Dashboard>
NEXT_PUBLIC_WHATSAPP_NUMBER=917397189222
NEXT_PUBLIC_BUSINESS_NAME=ONLY GADJETS
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_PREPAID_DISCOUNT_PCT=3
```

**Where to get the keys:**
1. Go to https://supabase.com/dashboard
2. Open your project → **Settings** → **API**
3. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ Change `ADMIN_PASSWORD` to something secure before deploying!

---

## Step 2: Set Up the Database

1. Go to your Supabase project → **SQL Editor** → **New Query**
2. Open the file `supabase/schema.sql` from this project
3. Copy all the SQL and paste it into the editor
4. Click **Run**

This creates all tables, security policies, and 3 sample products.

---

## Step 3: Run Locally

```bash
npm run dev
```

Open: **http://localhost:3000**

---

## Step 4: Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to https://vercel.com → **New Project** → Import your repo
3. In **Environment Variables**, add all 7 variables from `.env.local`
4. Click **Deploy**

Your website will be live at `https://your-project.vercel.app`

---

## Admin Panel

- URL: `/admin/login`
- Default password: `admin123` (change in `.env.local`)
- Features:
  - ✅ Add / Edit / Delete products
  - ✅ Toggle In Stock / Out of Stock
  - ✅ View all orders
  - ✅ Stats dashboard

---

## Page Routes

| Page | URL |
|------|-----|
| Homepage | `/` |
| Product Detail | `/products/[slug]` |
| Place Order | `/order?productId=...` |
| Admin Login | `/admin/login` |
| Admin Dashboard | `/admin/dashboard` |

---

## Adding Products (via Admin Panel)

1. Go to `/admin/login`
2. Enter your admin password
3. Click **Add Product**
4. Fill in: Name, Category, Online Price, Our Price, Stock, Images (paste image URLs)
5. Click **Add Product**

Products appear instantly on the homepage.

---

## Payment Logic

| Option | How it works |
|--------|-------------|
| Half COD | Customer pays 50% advance, 50% on delivery |
| Full Prepaid | Customer pays full amount with 3% extra discount |

Both options auto-calculate — users cannot edit prices.
