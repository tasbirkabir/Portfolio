# Static Website Deployment — Tasbir Kabir Platform

Deploy the full visual site to **Hostinger shared hosting** (or any static host) — no Node.js server required. The result is a pure HTML/CSS/JS website with `index.html` that works everywhere.

---

## What works in the static version

✅ **Full visual design** — Home, About, Books (Apple-Books shelves), Resources, Blog, Contact
✅ **Premium ebook reader** — bookmarks, highlights, notes, search, sepia/dark/light, fullscreen, Dynamic Island TOC (all saved to localStorage)
✅ **Chapter 1 free preview + 5% paywall** for paid books (purchase recorded in localStorage; reader unlocks instantly)
✅ **Multi-step project inquiry form** (6 steps) — falls back to opening the visitor's email client via `mailto:`
✅ **Newsletter signup** — falls back to `mailto:` confirmation
✅ **Global search** across books, articles, resources
✅ **Dark / light / sepia modes**
✅ **Mobile bottom navigation**
✅ **All animations and 3D book interactions**

## What requires a server (not in static version)

❌ Admin panel (CRUD management) — needs a Node.js server + database
❌ User accounts / login — needs a server
❌ Live payment processing (UddoktaPay/Stripe) — the checkout simulates and records locally
❌ Reading progress sync across devices — saved to localStorage per device only

> **Want the full version?** Use the `tasbir-kabir-platform.zip` (VPS version) on Hostinger VPS with Node.js. See `DEPLOYMENT.md`.

---

## Build the static site

### Prerequisites (on your local machine)
- [Node.js 20+](https://nodejs.org/)
- [Bun](https://bun.sh/) — `curl -fsSL https://bun.sh/install | bash`

### Steps

```bash
# 1. Extract the project ZIP
unzip tasbir-kabir-platform.zip -d tasbir-kabir
cd tasbir-kabir

# 2. Install dependencies
bun install

# 3. (Optional) Re-export the latest data from the database to static JSON
bun run prisma/export-static-data.ts
# → This regenerates public/data/*.json from the current database content

# 4. Build the static site
bash scripts/build-static.sh
# → Produces the `out/` directory with index.html + all assets

# 5. Zip the output for upload
cd out
zip -r ../tasbir-kabir-static.zip .
cd ..
```

The `tasbir-kabir-static.zip` now contains your complete static website.

---

## Deploy to Hostinger shared hosting

### Option A: Via Hostinger File Manager (easiest)

1. Log in to **hPanel** → **File Manager**
2. Navigate to **`public_html`**
3. Click **Upload** and select `tasbir-kabir-static.zip`
4. Right-click the ZIP → **Extract** → confirm extraction into `public_html`
5. Delete the ZIP file
6. Visit **tasbirkabir.site** — your site is live! 🎉

### Option B: Via FTP (FileZilla)

1. Connect to your Hostinger FTP:
   - Host: `ftp.tasbirkabir.site`
   - Username: your hPanel FTP user
   - Password: your FTP password
   - Port: 21
2. Navigate to `public_html/` on the server
3. Upload all files from the `out/` directory (drag & drop)
4. Visit your domain — done!

### Option C: Via SSH (if available on your plan)

```bash
# Upload the ZIP
scp tasbir-kabir-static.zip user@tasbirkabir.site:~/

# SSH in
ssh user@tasbirkabir.site

# Extract into public_html
cd ~/public_html
unzip ~/tasbir-kabir-static.zip
rm ~/tasbir-kabir-static.zip
```

---

## After deployment

### Force HTTPS
In **hPanel** → **Domains** → your domain → enable **Force HTTPS**.

### Set up a custom email (for the contact form)
The contact form and newsletter fall back to `mailto:tasbirrkabir@gmail.com`. To use a domain email instead, edit these files before building:
- `src/components/site/onboarding-form.tsx` → change `tasbirrkabir@gmail.com`
- `src/components/site/newsletter-band.tsx` → change `tasbirrkabir@gmail.com`

### Update content later
To update books, blog posts, or resources:
1. Edit the JSON files in `public/data/` directly (or re-run the export script after DB changes)
2. Re-run `bash scripts/build-static.sh`
3. Re-upload the `out/` directory

---

## Project structure (static output)

```
out/
├── index.html              ← the single-page app entry point
├── 404.html                ← auto-generated 404 page
├── _next/                  ← compiled JS/CSS chunks
├── images/                 ← logo, blog covers
└── data/                   ← static JSON content
    ├── books.json          ← all books (light payload for shelves)
    ├── book-{slug}.json    ← full book content (for the reader)
    ├── resources.json
    ├── blog.json
    ├── post-{slug}.json
    ├── testimonials.json
    ├── settings.json
    └── manifest.json
```

---

## Why a single `index.html`?

This Next.js app is a **single-page application (SPA)** — all pages (Home, Books, Blog, etc.) are client-side views rendered by JavaScript inside one `index.html`. The URL doesn't change between pages; instead, a Zustand store handles view routing in the browser. This makes it perfect for static hosting — there's literally one HTML file, and the JS handles everything.

---

## Troubleshooting

**The page is blank after upload?**
- Make sure you extracted into `public_html/` (not a subfolder)
- Check that `index.html` is at `public_html/index.html`
- Clear your browser cache and reload

**Images don't load?**
- Ensure the `images/` and `_next/` folders uploaded completely
- File paths are case-sensitive on Linux hosting — preserve case

**The contact form does nothing?**
- In static mode it opens your email client via `mailto:`. Make sure you have a mail client configured, or integrate [Formspree](https://formspree.io) for a serverless form backend.

---

© 2026 Tasbir Kabir. All rights reserved.
