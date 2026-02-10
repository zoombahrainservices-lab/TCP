# Supabase SQL – What to Run

## Single file to use

**File:** `FULL_CONTENT_MIGRATION.sql` (in this folder)

That file is **plain SQL only**. No markdown, no backticks.

## Steps

1. Open **Supabase Dashboard** → your project → **SQL Editor** → **New query**.
2. Open the file **`FULL_CONTENT_MIGRATION.sql`** in your editor (e.g. VS Code).
3. Select all (Ctrl+A) and copy.
4. Paste into the Supabase SQL Editor.
5. Click **Run**.

Done. That one run creates the schema and seeds parts, chapters, and steps.

## Verify

In a new query tab run:

```sql
SELECT p.title AS part, c.chapter_number, c.title AS chapter FROM parts p JOIN chapters c ON c.part_id = p.id ORDER BY c.chapter_number;
```

You should see 2 rows (Chapter 1 and Chapter 2).
