## XP v2 rollout checklist (ledger-based XP)

### Before rollout
- **Apply DB migration**: run `supabase/migrations/109_create_xp_events_table.sql` in Supabase.
- **Confirm RLS**: authenticated students/parents/admins can `SELECT` from `xp_events`, but clients cannot `INSERT` (service role only).
- **Set env vars**:
  - **`XP_SYSTEM_VERSION`**:
    - `v1` = dual-write (updates `profiles.xp` directly + writes `xp_events`)
    - `v2` = ledger source of truth (sets `profiles.xp` from `SUM(xp_events)`)
- **Backfill historical completions** (optional but recommended before switching to `v2`):
  - Dry run: `npm run migrate-xp-v2 -- --dry-run`
  - Real run: `npm run migrate-xp-v2`
  - If re-running: `npm run migrate-xp-v2 -- --reset` (deletes existing `xp_events` first)
  - Single user: `npm run migrate-xp-v2 -- --user <USER_ID>`

### Gradual rollout plan
- **Step 1 (small cohort)**:
  - Keep **`XP_SYSTEM_VERSION=v1`** (dual-write) for everyone.
  - Validate that `xp_events` are being created for real completions.
- **Step 2 (comparison monitoring)**:
  - Run comparison report daily: `npm run compare-xp`
  - Investigate discrepancies (expected delta is `0`).
- **Step 3 (switch to v2)**:
  - Change **`XP_SYSTEM_VERSION=v2`** (ledger becomes the source of truth).
  - Re-run `npm run compare-xp` and confirm ongoing `0` delta for active users.

### What to monitor during rollout
- **xp_events write failures** (server logs): insert/upsert errors, service role missing, permission issues.
- **Duplicate award attempts**: should show as inserts ignored (unique constraint hit) without breaking UX.
- **Mismatch**: `profiles.xp` vs `SUM(xp_events.xp_amount)` using `npm run compare-xp`.
- **Performance**:
  - `xp_events` growth and query latency
  - `getStudentXP()` calls that aggregate per user (watch response times).

### Post-rollout cleanup (after stability period)
- Remove the v1 direct-write path if no longer needed.
- Keep `xp_events` as the audit ledger for support and analytics.

