# Supreme Tailors — Digital Management System

A mobile-first web application for managing tailoring orders, measurements, and customer communications.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **SMS:** Fast2SMS API (Indian SMS provider)
- **Language:** TypeScript

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/supreme-tailors.git
cd supreme-tailors
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy your keys
3. Run the SQL in `supabase/schema.sql` in the **SQL Editor**
4. Go to **Authentication → Users → Add User** and create the admin account (e.g. `admin@supremetailors.com`)
5. Copy the admin user's UUID and update the seed section in `schema.sql`, then run it

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

#### Required Variables

| Variable | Where to find it | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | ✅ Yes (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` `public` key | ✅ Yes (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` key | ❌ Server only |
| `FAST2SMS_API_KEY` | [fast2sms.com](https://fast2sms.com) → Dev API → API Key | ❌ Server only |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Must match the admin email in Supabase Auth | ✅ Yes (public) |

> **⚠️ IMPORTANT:** `SUPABASE_SERVICE_ROLE_KEY` has full database access and bypasses Row Level Security. Never expose it in client-side code or commit it to git.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

### Option A: Auto-deploy via GitHub (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel auto-detects Next.js — no config changes needed
5. Add the **5 environment variables** listed above in the Vercel dashboard:
   - Go to **Settings → Environment Variables**
   - Add each variable for the **Production** environment
6. Click **Deploy**

Every future `git push` to the `main` branch will automatically trigger a new deployment.

### Option B: Deploy via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Set env vars via CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add FAST2SMS_API_KEY
vercel env add NEXT_PUBLIC_ADMIN_EMAIL
```

---

## Project Structure

```
supreme-tailors/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Customer login
│   │   ├── register/             # Customer registration
│   │   ├── orders/               # Customer portal (order list + detail)
│   │   ├── admin/
│   │   │   ├── login/            # Admin login
│   │   │   ├── dashboard/        # Order management dashboard
│   │   │   └── orders/
│   │   │       ├── new/          # Create new order (multi-step form)
│   │   │       └── [id]/         # Order detail (status stepper, measurements)
│   │   └── actions/              # Server Actions (createOrder, auth, status, SMS)
│   ├── lib/
│   │   ├── supabase/             # Supabase clients (browser, server, admin, middleware)
│   │   └── types/                # TypeScript interfaces
│   └── middleware.ts             # Route protection (admin + customer)
├── supabase/
│   └── schema.sql                # Full database schema + RLS + triggers
├── .env.example                  # Template for environment variables
└── tailwind.config.ts
```

---

## Features

### Admin Portal (`/admin/*`)
- 📊 Dashboard with order cards, status color-coding, search
- ➕ Multi-step order creation (customer info → measurements)
- 📐 Shirt & pant measurements with cm/inches toggle
- 🔄 3-step status stepper (Received → In Progress → Ready)
- 📱 Automatic SMS via Fast2SMS when order is marked "Ready"
- ✏️ Inline edit for delivery date & notes

### Customer Portal (`/orders/*`)
- 🔐 Email/password registration & login
- 📦 View all personal orders with status badges
- 📊 Visual progress tracker (green stepper)
- 📐 Read-only measurement table
- 📞 Shop contact info

---

## License

Private — Supreme Tailors © 2026
