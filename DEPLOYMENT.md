# Tasbir Kabir — Digital HQ Platform

A complete personal-brand operating system for Tasbir Kabir. Built with Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and Framer Motion.

**Stack:** Apple Books × Notion × Ali Abdaal × Gumroad × Kindle

---

## What's inside

- **Public website** — Home, About, Books (Apple-Books shelves), Resources, Blog, Contact, Search
- **Premium ebook reader** — bookmarks, highlights, notes, search, sepia/dark/light modes, fullscreen, reading stats, Dynamic Island TOC
- **Preview system** — Chapter 1 free + 5% preview for paid books, paywall CTA → instant unlock
- **Auth** — register / login / logout with session cookies
- **Payments** — UddoktaPay-style checkout (bKash · Nagad · Rocket · Card) → instant library access
- **User library** — purchased books, continue reading, reading progress sync, resources
- **Admin panel** (`/admin` view) — dashboard with revenue chart, ebooks/blog/resources CRUD, orders, users, newsletter broadcasts, analytics, site settings (homepage/nav/footer/brand/SEO builder)
- **SEO** — sitemap.xml, rss.xml, robots.txt, per-content SEO fields

### Demo accounts
- **Admin:** `admin@tasbirkabir.site` / `admin123`
- **Reader:** `reader@demo.com` / `demo123`

---

## Deploying to Hostinger VPS

### 1. Prerequisites

- A Hostinger VPS (any plan with ≥2GB RAM recommended)
- Node.js 20+ and Bun installed on the server
- SSH access

### 2. Upload the project

Upload this ZIP to your VPS and extract it:

```bash
# On your local machine, upload via SCP:
scp tasbir-kabir-platform.zip root@your-server-ip:/root/

# On the VPS:
ssh root@your-server-ip
unzip tasbir-kabir-platform.zip -d /var/www/tasbir-kabir
cd /var/www/tasbir-kabir
```

### 3. Install dependencies

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install project dependencies
bun install
```

### 4. Configure environment

Create a `.env` file:

```bash
DATABASE_URL="file:/var/www/tasbir-kabir/db/custom.db"
```

> For production, consider switching to PostgreSQL (Supabase/Neon) by updating `prisma/schema.prisma` datasource and the `DATABASE_URL`.

### 5. Set up the database

```bash
# Push the schema
bun run db:push

# Seed the content (books, blog, resources, testimonials, admin user, demo orders)
bun run prisma/seed-platform.ts

# (Optional) Import the full AI Agency OS ebook from the PDF
bun run prisma/import-ebook-pdf.ts
```

### 6. Build the production bundle

```bash
bun run build
```

### 7. Start the production server

```bash
# Using the standalone server
NODE_ENV=production bun .next/standalone/server.js
```

Or with PM2 for process management:

```bash
npm install -g pm2
pm2 start "bun .next/standalone/server.js" --name tasbir-kabir
pm2 save
pm2 startup
```

### 8. Configure Nginx (reverse proxy)

Create `/etc/nginx/sites-available/tasbir-kabir`:

```nginx
server {
    listen 80;
    server_name tasbirkabir.site www.tasbirkabir.site;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
ln -s /etc/nginx/sites-available/tasbir-kabir /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 9. SSL (Let's Encrypt)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d tasbirkabir.site -d www.tasbirkabir.site
```

### 10. (Optional) Set up UddoktaPay

To enable real payments, sign up at [UddoktaPay](https://uddoktapay.com) and replace the mock checkout in `src/app/api/orders/checkout/route.ts` with their API integration. The current implementation simulates the payment flow for demo purposes.

---

## Project structure

```
tasbir-kabir-platform/
├── prisma/
│   ├── schema.prisma          # Database schema (all models)
│   ├── seed-platform.ts       # Seeds all content + admin user + demo data
│   └── import-ebook-pdf.ts    # Imports the AI Agency OS PDF content
├── src/
│   ├── app/
│   │   ├── api/               # All API routes (auth, admin, checkout, etc.)
│   │   ├── layout.tsx         # Root layout with fonts + theme provider
│   │   ├── page.tsx           # Single-page app entry
│   │   ├── globals.css        # Design system (premium palette + typography)
│   │   ├── sitemap.xml/       # Auto sitemap
│   │   ├── rss.xml/           # RSS feed
│   │   └── robots/            # robots.txt
│   ├── components/
│   │   ├── admin/             # Full admin panel (dashboard, CRUD, settings)
│   │   ├── platform/          # Auth modal, checkout modal
│   │   ├── reader/            # Premium ebook reader + Dynamic Island
│   │   ├── site/              # Navbar, footer, book covers, shelves, logo
│   │   ├── ui/                # shadcn/ui components
│   │   └── views/             # All page views (home, books, blog, etc.)
│   ├── hooks/                 # useFetch, useToast, useMobile
│   └── lib/
│       ├── auth/              # Session management
│       ├── store/             # Zustand stores (nav, auth)
│       ├── db.ts              # Prisma client
│       └── utils.ts           # cn() utility
├── public/
│   └── images/                # Logo, blog covers
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── DEPLOYMENT.md              # This file
```

---

## Admin panel access

1. Navigate to the site
2. Sign in with `admin@tasbirkabir.site` / `admin123`
3. Click the **Admin** badge in the navbar (appears for admin users)
4. Manage everything from the dashboard — no code editing required

---

## Tech notes

- **Database:** SQLite (sandbox) — switch to PostgreSQL for production by updating `prisma/schema.prisma`
- **Auth:** Cookie-based sessions (demo) — replace with Supabase Auth or NextAuth for production
- **Payments:** Mock UddoktaPay flow — integrate the real UddoktaPay API for live payments
- **Email:** Newsletter broadcasts are logged but not sent — integrate Resend for real email delivery
- **Storage:** File URLs are stored in the DB — integrate Supabase Storage or S3 for file uploads

---

© 2026 Tasbir Kabir. All rights reserved.
