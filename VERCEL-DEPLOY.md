# Vercel + Supabase Deployment Guide

Complete step-by-step guide to deploy the Tasbir Kabir Digital HQ to Vercel with Supabase Auth + Postgres.

---

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [Supabase](https://supabase.com) account (free tier works)
- A GitHub account (for code hosting)

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it: `tasbirkabir`
3. Set a strong database password (save it!)
4. Choose the region closest to your users
5. Click **Create** — wait ~2 minutes for provisioning

---

## Step 2: Get Your Supabase Keys

1. Go to **Settings** → **API**
2. Copy these 3 values:

| Key | Where to find it |
|-----|-----------------|
| **Project URL** | `https://xxxxx.supabase.co` |
| **anon public key** | A long JWT string |
| **service_role key** | A long JWT string (keep secret!) |

3. Go to **Settings** → **Database** → **Connection string**
4. Copy the **Transaction** connection string (port 6543):
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres
   ```
   Replace `[PASSWORD]` with your database password from Step 1.

---

## Step 3: Configure Supabase Auth

1. Go to **Authentication** → **URL Configuration**
2. Set:
   - **Site URL**: `https://www.tasbirkabir.site` (or your Vercel URL)
   - **Redirect URLs**: `https://www.tasbirkabir.site/auth/callback`
3. Go to **Authentication** → **Providers** → **Email**
4. Enable **Email** provider
5. (Recommended) Enable **Confirm email** — users must verify before signing in
6. (Optional) Disable email confirmation for faster testing — toggle off "Confirm email"

---

## Step 4: Push the Database Schema

On your local machine (with the project unzipped):

```bash
# Set environment variables temporarily
export NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres"
export DATABASE_PROVIDER="postgresql"

# Install dependencies
bun install

# Push the Prisma schema to Supabase Postgres
bun run db:push

# Seed the content (books, blog posts, resources)
bun run prisma/seed-platform.ts

# Create the admin user in Supabase + Profile
bun run scripts/setup-admin.ts
```

You should see:
```
✓ Admin setup complete!
Admin login:
  Email:    admin@tasbirkabir.site
  Password: ChangeMe2026!
```

---

## Step 5: Deploy to Vercel

1. Push the code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Vercel auto-detects Next.js — keep the default settings
5. Go to **Environment Variables** and add ALL of these:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `DATABASE_URL` | `postgresql://postgres:...@db.xxxxx.supabase.co:6543/postgres` |
| `DATABASE_PROVIDER` | `postgresql` |

6. Click **Deploy**
7. Wait 2-3 minutes for the build to complete

---

## Step 6: Configure Custom Domain

1. In Vercel → **Settings** → **Domains**
2. Add `tasbirkabir.site` and `www.tasbirkabir.site`
3. Update your DNS records to point to Vercel:
   - `A` record: `@` → `76.76.21.21`
   - `CNAME` record: `www` → `cname.vercel-dns.com`
4. Go back to Supabase → **Authentication** → **URL Configuration**
5. Update the **Site URL** and **Redirect URLs** to use your final domain

---

## Step 7: Verify Everything Works

1. Visit `https://www.tasbirkabir.site`
2. Click **Sign In**
3. Login with `admin@tasbirkabir.site` / `ChangeMe2026!`
4. Verify the admin panel loads (click "Admin" in navbar)
5. Verify protected pages work:
   - `/account` — shows profile
   - `/library` — shows purchased books
6. Test sign out and sign in again

---

## How Authentication Works

| Feature | Implementation |
|---------|---------------|
| **Sign Up** | Supabase `auth.signUp()` — creates auth user + Profile row |
| **Sign In** | Supabase `auth.signInWithPassword()` — sets session cookies |
| **Sign Out** | Supabase `auth.signOut()` — clears session |
| **Password Reset** | Supabase `auth.resetPasswordForEmail()` — sends reset link |
| **Email Verification** | Supabase sends verification email → `/auth/callback` |
| **Session Persistence** | Middleware refreshes JWT on every request |
| **Admin Protection** | Server-side: `requireAdmin()` checks Supabase session + Profile.role |
| **Protected Routes** | Client-side views check auth state; API routes check server-side |

---

## Troubleshooting

### "Invalid login credentials"
- The email/password is wrong
- Or the admin user hasn't been created yet — run `bun run scripts/setup-admin.ts`

### "Email not confirmed"
- Supabase requires email verification
- Either verify the email, or disable email confirmation in Supabase Dashboard

### Login works locally but not on Vercel
- Check that all 5 environment variables are set in Vercel
- Check that `DATABASE_PROVIDER` is `postgresql` (not `sqlite`)
- Check the Vercel function logs for errors

### Database connection errors
- Make sure you're using the **Transaction** connection string (port 6543)
- Make sure the password is URL-encoded if it contains special characters

### Admin panel shows "Admin only"
- The user's Profile.role is not "admin"
- Run `bun run scripts/setup-admin.ts` to set the admin role
