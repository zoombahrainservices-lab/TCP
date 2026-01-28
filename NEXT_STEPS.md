# Next Steps: Full Reset (Auth + DB)

For **local dev** (localhost + Google OAuth), see **[LOCAL_DEV_SETUP.md](./LOCAL_DEV_SETUP.md)**.

---

Use this when you want to **drop all auth users**, **purge custom tables**, and **re-open registration** so everyone signs up again as normal users. You’ll manually promote one user to admin later.

---

## 1. Delete all auth users

**Option A – Script (recommended)**

From the **tcp-platform** directory (where `package.json` and `.env.local` live):

```bash
cd tcp-platform
npx tsx scripts/delete-all-auth-users.ts
```

Or run the npm script:

```bash
cd tcp-platform
npm run db:delete-users
```

Uses `SUPABASE_SERVICE_ROLE_KEY` from `tcp-platform/.env.local`. You’ll be prompted to confirm.

**Option B – Supabase Dashboard**

- **Authentication → Users**
- Delete each user (or use bulk delete if available).

**If delete fails:**  
Users who own **Storage** objects can’t be deleted until those objects are removed or ownership is changed. Either empty the relevant buckets (Dashboard → Storage) or delete the objects first, then run the script again.

---

## 2. Drop all custom tables

1. Open **Supabase Dashboard → SQL Editor**.
2. Run the contents of **`supabase/drop_all_tables.sql`** (copy-paste or run the file).

This drops triggers, functions, views, and all custom tables (e.g. `profiles`, `zones`, `chapters`, …). `auth.users` is **not** touched.

---

## 3. Create fresh schema

1. Still in **SQL Editor**.
2. Run the contents of **`supabase/fresh_schema.sql`**.

This creates:

- Minimal **`profiles`** table (`id`, `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`).
- RLS policies (users can read/update own profile).
- Trigger to auto-create a profile on signup.

---

## 4. Re-open registration

- **Login** → `/auth/login`
- **Register** → `/auth/register`

All new users are treated as **normal users** and land on `/dashboard`. No roles in the app for now.

---

## 5. Promote one user to admin (later)

When you’re ready:

1. Add a **`role`** column to `profiles`, e.g. `'user' | 'admin'`.
2. Run something like:

   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@example.com';
   ```

3. Add **admin-only routes** and guard them by `role === 'admin'`.

Moderators can be added later (e.g. `role = 'moderator'`) using the same pattern.

---

## Summary

| Step | Action | Where |
|------|--------|--------|
| 1 | Delete all auth users | From `tcp-platform`: `npm run db:delete-users` or Dashboard |
| 2 | Drop custom tables | Supabase SQL Editor → `supabase/drop_all_tables.sql` |
| 3 | Create fresh schema | Supabase SQL Editor → `supabase/fresh_schema.sql` |
| 4 | Use app | Login / Register → Dashboard |
| 5 | (Later) Add `role`, promote admin | DB + app code |
