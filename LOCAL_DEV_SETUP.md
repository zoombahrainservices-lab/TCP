# Local development setup (localhost + Google OAuth)

Use this so you can log in at **http://localhost:3000/auth/login** with **email/password** and **Google**, then develop locally.

---

## 1. Environment variables

In **`tcp-platform/.env.local`**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required for Google OAuth redirect back to localhost
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For local dev, **`NEXT_PUBLIC_APP_URL`** must be `http://localhost:3000`.  
When you deploy (e.g. Vercel), change it to your production URL.

---

## 2. Supabase Dashboard – URL configuration

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **URL Configuration**.
3. Set:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** Add:
     - `http://localhost:3000`
     - `http://localhost:3000/auth/callback`
4. Save.

When you deploy, update **Site URL** and **Redirect URLs** to your production domain (e.g. `https://your-app.vercel.app` and `https://your-app.vercel.app/auth/callback`).

---

## 3. Google OAuth (if not already set)

1. [Google Cloud Console](https://console.cloud.google.com/) → your project → **APIs & Services** → **Credentials**.
2. Open your **OAuth 2.0 Client ID** (Web application).
3. **Authorized redirect URIs** must include:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`  
   (Use your real Supabase project ref from the Supabase URL.)
4. Save.

You do **not** add `http://localhost:3000` here. Google redirects to Supabase; Supabase then redirects to your app using **Redirect URLs** above.

---

## 4. Run the app

```powershell
cd tcp-platform
npm run dev
```

Open **http://localhost:3000/auth/login**.

- **Email/password:** Register at **http://localhost:3000/auth/register**, then sign in.
- **Google:** Click “Google” and complete the OAuth flow. You’ll be sent back to `http://localhost:3000/auth/callback` and then to `/dashboard`.

---

## 5. Troubleshooting

| Issue | What to check |
|-------|----------------|
| Google redirects to wrong URL or “redirect_uri” error | Redirect URLs in Supabase include `http://localhost:3000/auth/callback`. Google redirect URI is the **Supabase** callback, not localhost. |
| “exchange_failed” or “no_code” on callback | Same as above. Also ensure **Site URL** is `http://localhost:3000` during local dev. |
| Email sign-up says “User already registered” | That email already exists in Supabase Auth. Use another email or delete the user in **Authentication → Users** (or via `npm run db:delete-users`). |
