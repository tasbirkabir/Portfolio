# Tasbir Kabir — Digital HQ Platform

A complete personal-brand operating system for Tasbir Kabir. Built with Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and Framer Motion.

**Stack:** Apple Books × Notion × Ali Abdaal × Gumroad × Kindle

---

## Quick Start (Development)

```bash
# 1. Install dependencies
bun install

# 2. Set up the database
bun run db:push

# 3. Seed all content (books, blog, resources, testimonials, admin user, demo orders)
bun run prisma/seed-platform.ts

# 4. (Optional) Import the full AI Agency OS ebook from the PDF
bun run prisma/import-ebook-pdf.ts

# 5. Start the dev server
bun run dev
# → Visit http://localhost:3000
```

### Demo accounts
- **Admin:** `admin@tasbirkabir.site` / `admin123`
- **Reader:** `reader@demo.com` / `demo123`

---

## What's inside

### Public website
- **Home** — hero with portrait, featured ebook, stats, social proof, latest resources, newsletter
- **About** — story, mission, services, process, timeline, achievements
- **Books** — Apple-Books-inspired category shelves with horizontal scrolling covers
- **Single Book** — premium sales page with sticky purchase card, TOC, reviews, FAQ
- **Resources** — free PDFs, templates, checklists, prompt packs (filterable)
- **Blog** — editorial reading experience with drop caps and Dynamic Island TOC
- **Contact** — 6-step multi-step project inquiry form
- **Search** — global instant search across books, articles, resources
- **Library** — purchased books, continue reading, reading progress, resources
- **Account** — profile, order history, total spent

### Premium ebook reader
- Bookmarks, highlights, notes, in-book search
- Light / dark / sepia reading modes
- Fullscreen mode
- Font size & family controls
- Reading progress sync (for logged-in users)
- **Dynamic Island TOC** — collapsed: chapter + % + time remaining + progress ring; expanded: contents, bookmarks, highlights, search, stats
- **Preview system** — Chapter 1 free + 5% preview for paid books, paywall CTA → instant unlock

### Auth & payments
- Register / login / logout with session cookies
- 5 access types: public, free, email-gate, paid, members
- **UddoktaPay-style checkout** — bKash, Nagad, Rocket, Card
- Successful payment → instant library access unlock
- Reading progress sync across devices

### Admin panel (`/admin` view, admin-gated)
- **Dashboard** — revenue, orders, users, subscribers, downloads + 14-day revenue chart + recent orders + top products
- **Ebooks** — full CRUD with rich editor (title, price, category, access type, status, content JSON, SEO)
- **Blog** — CRUD with Markdown editor, categories, tags, scheduling
- **Resources** — CRUD for 8 types with access type + price + file URL
- **Orders** — filterable list, status changes (paid/pending/failed/refunded)
- **Users** — ban/unban, promote/demote admin, grant access, delete
- **Newsletter** — subscriber list, CSV export, segment broadcast
- **Analytics** — daily revenue chart, event-breakdown pie chart, recent events
- **Site Settings** — homepage builder, navigation builder, footer builder, brand settings, SEO defaults

### SEO
- `/sitemap.xml` — auto-generated sitemap
- `/rss.xml` — RSS feed for blog
- `/robots.txt` — robots with admin disallow
- Per-content SEO fields (title, description) on books and blog posts

---

## Deployment

### Option A: Hostinger VPS (full-featured, recommended)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete VPS instructions with Nginx + PM2 + SSL.

```bash
# On the VPS:
bun install
bun run db:push
bun run prisma/seed-platform.ts
bun run build
pm2 start "bun .next/standalone/server.js" --name tasbir-kabir
```

### Option B: Static website (Hostinger shared hosting)

For a pure HTML/CSS/JS site with `index.html` — no Node.js server required.

See [STATIC-DEPLOYMENT.md](./STATIC-DEPLOYMENT.md) for complete instructions.

```bash
# Export DB content to static JSON
bun run prisma/export-static-data.ts

# Build the static site (produces out/ directory)
bash scripts/build-static.sh

# Upload the contents of out/ to public_html via File Manager or FTP
```

**Static version includes:** full visual site, premium reader (localStorage), preview paywall, search, dark mode, contact form (mailto fallback).

**Static version excludes:** admin panel, user login, live payments (these need a server).

---

## Project structure

```
tasbir-kabir/
├── prisma/
│   ├── schema.prisma              # Database schema (all models)
│   ├── seed-platform.ts           # Seeds all content + admin user + demo data
│   ├── import-ebook-pdf.ts        # Imports the AI Agency OS PDF content
│   ├── export-static-data.ts      # Exports DB to static JSON for static hosting
│   └── update-testimonials.ts     # Updates testimonials
├── scripts/
│   └── build-static.sh            # One-command static site build
├── src/
│   ├── app/
│   │   ├── api/                   # All API routes (32 files)
│   │   │   ├── auth/              # login, register, me, logout, access
│   │   │   ├── admin/             # books, blog, resources, orders, users, newsletter, settings
│   │   │   ├── books/             # public book endpoints
│   │   │   ├── blog/              # public blog endpoints
│   │   │   ├── orders/            # checkout
│   │   │   ├── library/           # user library
│   │   │   ├── progress/          # reading progress sync
│   │   │   ├── analytics/         # analytics aggregation
│   │   │   ├── search/            # global search
│   │   │   ├── settings/          # public site settings
│   │   │   ├── contact/           # contact form
│   │   │   └── newsletter/        # newsletter signup
│   │   ├── layout.tsx             # Root layout (fonts, theme, viewport-fit=cover)
│   │   ├── page.tsx               # Single-page app entry
│   │   ├── globals.css            # Design system (premium palette, typography, utilities)
│   │   ├── sitemap.xml/           # Auto sitemap route
│   │   ├── rss.xml/               # RSS feed route
│   │   └── robots/                # robots.txt route
│   ├── components/
│   │   ├── admin/                 # Full admin panel (9 files)
│   │   ├── platform/              # Auth modal, checkout modal
│   │   ├── reader/                # Premium ebook reader + Dynamic Island
│   │   ├── site/                  # Navbar, mobile nav, footer, book covers, shelves, logo, ExpandableTabs, onboarding form, newsletter band
│   │   ├── ui/                    # shadcn/ui components (50+ files)
│   │   └── views/                 # All page views (home, about, books, book, resources, blog, post, contact, library, account, search, auth-prompt)
│   ├── hooks/                     # useData, useToast, useMobile, useFetch
│   └── lib/
│       ├── auth/                  # Session management (cookie-based)
│       ├── store/                 # Zustand stores (nav, auth)
│       ├── db.ts                  # Prisma client
│       ├── utils.ts               # cn() utility
│       └── static-mode.ts         # Static-host detection
├── public/
│   ├── images/                    # Logo, blog covers
│   └── data/                      # Static JSON content (for static hosting)
├── package.json
├── next.config.ts                 # Dev/standalone config
├── next.config.static.ts          # Static export config (swap in for static build)
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── DEPLOYMENT.md                  # VPS deployment guide
├── STATIC-DEPLOYMENT.md           # Static hosting deployment guide
└── .env                           # DATABASE_URL
```

---

## Responsive design

Tested and optimized across all breakpoints:

| Category | Widths |
|----------|--------|
| Mobile | 320, 360, 375, 390, 412, 430px |
| Tablet | 768, 820, 1024px |
| Desktop | 1280, 1440, 1920px |

- No horizontal overflow at any width
- Mobile bottom nav floats 28px above bottom edge with `env(safe-area-inset-bottom)` support
- Top navbar is fixed with solid background on mobile, transparent on desktop
- All modals (auth, checkout) are scrollable and full-width on mobile
- `viewport-fit=cover` meta for iOS notch support

---

## Tech notes

- **Database:** SQLite (sandbox) — switch to PostgreSQL for production by updating `prisma/schema.prisma`
- **Auth:** Cookie-based sessions — replace with Supabase Auth or NextAuth for production
- **Payments:** Mock UddoktaPay flow — integrate the real UddoktaPay API for live payments
- **Email:** Newsletter broadcasts are logged but not sent — integrate Resend for real email delivery
- **Storage:** File URLs are stored in the DB — integrate Supabase Storage or S3 for file uploads

---

© 2026 Tasbir Kabir. All rights reserved.
