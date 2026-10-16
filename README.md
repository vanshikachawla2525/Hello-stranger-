# Vanshika Chawla — hello, stranger.

An autobiographical memory archive and digital diary with a real-time owner admin portal.

## Deploy to Vercel Guide

### 1. Supabase Project Setup
1. Create a project in [Supabase](https://supabase.com).
2. Go to **SQL Editor** → **New query**, paste the contents of `supabase/schema.sql` (replace `owner@example.com` with your real admin email in all 3 places), and click **Run**.

### 2. Configure Owner Authentication
1. In Supabase, go to **Authentication** → **Users** → **Add user**.
2. Enter the owner email and a secure password, and tick **Auto Confirm User**.
3. Go to **Authentication** → **Providers** → **Email**, and turn **OFF** *"Allow new users to sign up"* so only you have access.

### 3. Copy API Credentials
1. In Supabase, go to **Project Settings** → **API**.
2. Copy your **Project URL** and the public **anon key**.

### 4. Deploy on Vercel
1. Import the repository into [Vercel](https://vercel.com) (Framework: **Vite**).
2. In **Settings** → **Environment Variables**, add the following 3 variables for both **Production** and **Preview**:
   - `VITE_ADMIN_EMAIL`: Your admin email (e.g. `vanshikachawla2525@gmail.com`)
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xxxxxxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase public anon key (`eyJ...`)
3. Click **Deploy**.
   > *Note: Vite inlines client environment variables at build time. Whenever you update environment variables in Vercel, trigger a **Redeploy** with "Use existing build cache" un-ticked.*

### 5. Access the Owner Portal
1. Open `https://<your-deployed-site>/admin`.
2. Click the discrete red seam dot or the **"owner unlock"** button.
3. Sign in with the Supabase owner email and password.

---

## Troubleshooting Guide

| Error Message in Portal | Cause | Fix |
|---|---|---|
| **Supabase isn't configured.** | `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing at build time. | Add both in Vercel → **Settings** → **Environment Variables**, then Redeploy with cache cleared. |
| **VITE_ADMIN_EMAIL isn't set.** | `VITE_ADMIN_EMAIL` missing at build time. | Add `VITE_ADMIN_EMAIL` in Vercel and Redeploy. |
| **Wrong email or password.** | Credentials do not match any existing Supabase user. | Verify the password in Supabase or reset it under **Authentication** → **Users**. |
| **This Supabase user isn't confirmed.** | User was created with email confirmation required. | In Supabase → **Authentication** → **Users**, confirm the user (or delete and re-create with **Auto Confirm User** ticked). |
| **This account isn't the site owner.** | User signed in with an email that does not match `VITE_ADMIN_EMAIL`. | Sign in using the exact email address defined in `VITE_ADMIN_EMAIL`. |
| **Couldn't reach Supabase.** | Network error or invalid `VITE_SUPABASE_URL`. | Check `VITE_SUPABASE_URL` and ensure project is active. |
| **Not signed in as the owner. Log out and log in again.** | Supabase JWT expired or Row-Level Security policy blocked write. | Log out from the portal and log in again with the owner email. |
| **Local storage is full — publish to Supabase or clear revision history.** | Browser localStorage quota exceeded. | Publish changes to Supabase or clear revision history in the dashboard to free space. |
