# 🚀 LAUNCH GUIDE — Go Live Checklist

This guide tells you exactly what to do, where to paste keys, and how to make every feature fully live.

---

## STEP 1: Set Up Your Server (Hostinger VPS)

```bash
# SSH into your VPS
ssh root@your-server-ip

# Install Node.js 20+ and Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Upload the project ZIP and extract
cd /var/www
unzip tasbir-kabir-platform.zip -d tasbir-kabir
cd tasbir-kabir

# Install dependencies
bun install
```

---

## STEP 2: Configure Environment Variables

Copy `.env.example` to `.env` and fill in EVERY value:

```bash
cp .env.example .env
nano .env
```

### What to put in each field:

| Field | What to do |
|-------|-----------|
| `DATABASE_URL` | Keep default for SQLite, OR switch to PostgreSQL for production |
| `SESSION_SECRET` | Run `openssl rand -base64 32` and paste the output |
| `NEXT_PUBLIC_SITE_URL` | `https://tasbirkabir.site` (your real domain) |
| `RESEND_API_KEY` | Sign up at resend.com → API Keys → Create → Copy |
| `FROM_EMAIL` | `Tasbir Kabir <noreply@tasbirkabir.site>` (verify domain in Resend first) |

---

## STEP 3: Set Up the Database

```bash
# Push the schema
bun run db:push

# Seed the content (books, blog, resources, admin user)
bun run prisma/seed-platform.ts

# Import the full AI Agency OS ebook content
bun run prisma/import-ebook-html.ts

# (Optional) Seed demo downloadable assets
bun run prisma/seed-assets.ts
```

**Your admin account:**
- Email: `admin@tasbirkabir.site`
- Password: `ChangeMe2026!`
- ⚠️ **CHANGE THIS PASSWORD** after first login via Account → Sign out → Forgot password

---

## STEP 4: Configure a Payment Gateway

Choose ONE of the following. Paste the keys in `.env` and restart — it works automatically.

### Option A: SSL Commerz (recommended for Bangladesh)

1. Go to https://developer.sslcommerz.com/
2. Register as a merchant
3. Get your **Store ID** and **Store Password**
4. Put in `.env`:
```
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWD=your_store_password
SSLCOMMERZ_SANDBOX=false
```
5. Supports: bKash, Nagad, Rocket, Visa, Mastercard
6. Set up IPN URL in SSL Commerz dashboard: `https://tasbirkabir.site/api/payments/sslcommerz/callback`

### Option B: Stripe (recommended for international)

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret Key** (sk_live_...) and **Publishable Key** (pk_live_...)
3. Install the Stripe SDK: `bun add stripe`
4. Put in `.env`:
```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```
5. Set up webhook at https://dashboard.stripe.com/webhooks
   - Endpoint URL: `https://tasbirkabir.site/api/payments/stripe/webhook`
   - Events: `checkout.session.completed`

### Option C: UddoktaPay

1. Go to https://uddoktapay.com
2. Get your **API Key**
3. Put in `.env`:
```
UDDOKTAPAY_API_KEY=your_api_key
UDDOKTAPAY_BASE_URL=https://api.uddoktapay.com
```

### How the gateway selection works:
- If SSL Commerz keys are set → uses SSL Commerz
- Else if Stripe keys are set → uses Stripe
- Else if UddoktaPay keys are set → uses UddoktaPay
- Else → checkout still works (simulated payment for testing)

---

## STEP 5: Set Up Email (Resend)

Email is needed for:
- ✅ Password reset (users click "Forgot password?" → email with reset link)
- ✅ Newsletter broadcasts (admin sends from the panel)
- ✅ Welcome email on registration (optional)

1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Go to API Keys → Create → Copy the key
3. Verify your domain at https://resend.com/domains
   - Add the DNS records Resend gives you
   - Wait for verification (usually 5-15 minutes)
4. Put in `.env`:
```
RESEND_API_KEY=re_xxxxxxxx
FROM_EMAIL=Tasbir Kabir <noreply@tasbirkabir.site>
```

### Password reset flow (how it works):
1. User clicks "Forgot password?" in the sign-in modal
2. Enters their email
3. System generates a secure token (expires in 1 hour)
4. Resend sends an email with a reset link: `https://tasbirkabir.site/?v=account&reset=TOKEN`
5. User clicks the link → enters new password → done

---

## STEP 6: Build & Start

```bash
# Build the production bundle
bun run build

# Start the server
NODE_ENV=production bun .next/standalone/server.js

# Or with PM2 (keeps it running forever)
npm install -g pm2
pm2 start "bun .next/standalone/server.js" --name tasbir-kabir
pm2 save
pm2 startup
```

---

## STEP 7: Configure Nginx + SSL

```bash
# Create Nginx config
nano /etc/nginx/sites-available/tasbir-kabir
```

Paste:
```nginx
server {
    listen 80;
    server_name tasbirkabir.site www.tasbirkabir.site;
    
    client_max_body_size 100M;  # for ZIP ebook uploads

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

```bash
# Enable + restart
ln -s /etc/nginx/sites-available/tasbir-kabir /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# SSL certificate (free, via Let's Encrypt)
apt install certbot python3-certbot-nginx
certbot --nginx -d tasbirkabir.site -d www.tasbirkabir.site
```

---

## STEP 8: Final Checklist

After everything is set up, verify each feature:

| Feature | How to test | What you need |
|---------|-------------|---------------|
| **Site loads** | Visit https://tasbirkabir.site | Server running |
| **Sign up** | Click Sign in → Create account | SESSION_SECRET set |
| **Sign in** | Use your admin account | Database seeded |
| **Password reset** | Click "Forgot password?" → check email | RESEND_API_KEY + domain verified |
| **Browse books** | Click Books → view all 8 books | Database seeded |
| **Read preview** | Click "Read preview" on a book | Book content imported |
| **Buy a book** | Click "Buy now" → complete checkout | Payment gateway configured |
| **Library access** | After purchase → Library → book is there | Purchase flow working |
| **Download files** | Library → click Download PDF | Assets uploaded via admin |
| **Admin panel** | Sign in as admin → click Admin badge | Admin account |
| **Create ebook** | Admin → Ebooks → New ebook | Admin access |
| **Upload ZIP** | Admin → Ebooks → Publish from ZIP | Admin access |
| **Newsletter** | Admin → Newsletter → Send broadcast | RESEND_API_KEY set |
| **Analytics** | Admin → Analytics → view dashboard | Admin access |
| **Blog** | Admin → Blog → create post | Admin access |
| **SEO** | Visit /sitemap.xml and /rss.xml | Server running |
| **Dark mode** | Click moon icon in navbar | — |
| **Mobile** | Open on phone → bottom nav works | — |

---

## STEP 9: Change Admin Password

⚠️ **CRITICAL**: After seeding, your admin password is `ChangeMe2026!`. Change it immediately:

1. Sign out
2. Click "Forgot password?"
3. Enter `admin@tasbirkabir.site`
4. Check your email for the reset link
5. Set a strong new password

---

## STEP 10: Ongoing Management

### Update ebook content:
- Admin → Ebooks → Edit → change content in the JSON fields
- Or: Admin → Ebooks → Publish from ZIP → upload a complete HTML package

### Upload downloadable files:
- Admin → Ebooks → Edit book → scroll to "Downloadable Assets" → upload PDF/EPUB/ZIP/etc.

### View sales:
- Admin → Dashboard → revenue, orders, top products

### Send newsletter:
- Admin → Newsletter → write subject + body → Send broadcast

### Add blog posts:
- Admin → Blog → New post → write in Markdown → Publish

### Manage users:
- Admin → Users → ban, promote, grant access, delete

---

## Quick Reference: All API Keys You Need

| Service | What | Where to get it | Cost |
|---------|------|-----------------|------|
| **Session Secret** | Signs auth cookies | `openssl rand -base64 32` | Free |
| **Resend** | Email sending | https://resend.com/api-keys | Free (3K/month) |
| **SSL Commerz** | BD payments (bKash/Nagad/Rocket) | https://developer.sslcommerz.com/ | ~2.5% per transaction |
| **Stripe** | International payments | https://dashboard.stripe.com/apikeys | 2.9% + 30¢ per transaction |
| **UddoktaPay** | BD payments (alternative) | https://uddoktapay.com | ~2.5% per transaction |

You only need ONE payment gateway. SSL Commerz is recommended for Bangladesh.

---

## Troubleshooting

**Site won't load?**
- Check `pm2 status` — is the process running?
- Check `pm2 logs tasbir-kabir` for errors
- Check Nginx: `nginx -t`

**Payments not working?**
- Check that payment keys are in `.env`
- Restart the server after adding keys: `pm2 restart tasbir-kabir`
- Check `/api/payments/methods` — should show your gateway as "configured: true"

**Password reset email not arriving?**
- Check `RESEND_API_KEY` is set
- Check your domain is verified in Resend dashboard
- Check spam folder
- Check server logs: `pm2 logs tasbir-kabir | grep Resend`

**Can't upload ZIP files?**
- Check Nginx `client_max_body_size 100M` is set
- Check the file is under 100MB

---

© 2026 Tasbir Kabir. All rights reserved.
