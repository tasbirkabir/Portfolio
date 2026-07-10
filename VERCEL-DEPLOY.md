# Vercel + Supabase Deployment Guide

**Zero-setup deployment.** No scripts to run. No terminal commands needed.
Just set environment variables, deploy, and sign up.

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
6. (Optional for faster testing) Disable email confirmation — toggle off "Confirm email"

---

## Step 4: Set Up the Database Schema (one-time, via Supabase Dashboard)

**Option A: Run SQL in Supabase Dashboard (recommended — no local terminal needed)**

1. In your Supabase project, go to **SQL Editor**
2. Copy the contents of `prisma/schema.sql` from this project (if provided)
   — OR — run the Prisma migration locally once:

**Option B: Push schema locally (one-time only)**

```bash
# Only needed ONCE to create the database tables
# You do NOT need to run this on every deploy

export DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres"
bun install
bun run db:push
```

This creates all the tables (Book, BlogPost, Resource, Profile, etc.) in your Supabase Postgres database.

> **Note:** This is the only step that requires the terminal — it's a one-time database setup.
> After this, you never need to run any scripts again.

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
| `ADMIN_EMAIL` | `admin@tasbirkabir.site` (or your preferred admin email) |

6. Click **Deploy**
7. Wait 2-3 minutes for the build to complete

---

## Step 6: Create Your Admin Account (via the website — no scripts!)

1. Visit your deployed site: `https://www.tasbirkabir.site`
2. Click **Sign In** → switch to **Create an account**
3. Sign up using the email you set as `ADMIN_EMAIL` (e.g., `admin@tasbirkabir.site`)
4. If email confirmation is enabled, check your email and click the verification link
5. Sign in with your new account
6. **The account is automatically promoted to admin** — you'll see the "Admin" button in the navbar
7. Click **Admin** → access the full admin panel

**That's it. No scripts. No terminal commands. No manual database setup.**

---

## Step 7: Configure Custom Domain

1. In Vercel → **Settings** → **Domains**
2. Add `tasbirkabir.site` and `www.tasbirkabir.site`
3. Update your DNS records to point to Vercel:
   - `A` record: `@` → `76.76.21.21`
   - `CNAME` record: `www` → `cname.vercel-dns.com`
4. Go back to Supabase → **Authentication** → **URL Configuration**
5. Update the **Site URL** and **Redirect URLs** to use your final domain

---

## How Admin Roles Work (no setup scripts needed)

```
1. You set ADMIN_EMAIL="admin@tasbirkabir.site" in Vercel env vars
2. You sign up on the website with that exact email
3. The app sees the email matches ADMIN_EMAIL
4. The account is AUTOMATICALLY promoted to admin
5. Admin panel access is granted immediately
```

The role is stored in the `Profile` table in your database. You can also manually
change a user's role in the Supabase Dashboard → Table Editor → `Profile` table →
change `role` from `user` to `admin`.

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
| **Admin Role** | Auto-assigned when email matches `ADMIN_EMAIL` env var |
| **Admin Protection** | Server-side: `requireAdmin()` checks Supabase session + Profile.role |

---

## Troubleshooting

### "Invalid login credentials"
- The email/password is wrong
- Or you haven't created an account yet — sign up first

### "Email not confirmed"
- Supabase requires email verification
- Either verify the email, or disable email confirmation in Supabase Dashboard

### I signed up but don't see the Admin button
- Check that `ADMIN_EMAIL` in Vercel matches the email you signed up with (case-insensitive)
- Sign out and sign back in — the role check runs on login
- Or manually set `role = "admin"` in Supabase Dashboard → Table Editor → Profile table

### Login works locally but not on Vercel
- Check that all 5 environment variables are set in Vercel
- Check the Vercel function logs for errors

### Database connection errors
- Make sure you're using the **Transaction** connection string (port 6543)
- Make sure the password is URL-encoded if it contains special characters
- Make sure you ran `bun run db:push` once (Step 4) to create the tables
