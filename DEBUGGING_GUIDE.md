# React Hook Error #310 - Debugging Guide

## Current Status

✅ Single React version (19.2.3) - no duplicates  
✅ Production source maps enabled in `next.config.ts`  
✅ All fixes applied (but we need to verify the real culprit)

---

## Step 1: Run in DEV mode (non-minified)

```powershell
npm run dev
```

Open http://localhost:3000

**Reproduce the error:**
1. Navigate to Chapter 2
2. Click **Assessment** → **Techniques** → **Resolution** rapidly
3. Check the browser console

**What to look for:**
```
Uncaught Error: Rendered more hooks than during the previous render.
    at SelfCheckAssessment (SelfCheckAssessment.tsx:60)    <-- REAL FILE
    at Chapter2AssessmentPage (page.tsx:44)
```

**If you see this ↑**, paste the full stack trace here. The file + line number will show the exact problem.

**If you still see minified chunks** (`c889683bf7dd14cd.js:1:17640`), Next is serving cached production build. Clear it:

```powershell
rm -r .next
npm run dev
```

---

## Step 2: If dev mode doesn't show it, reproduce in PROD with source maps

```powershell
npm run build
npm run start
```

Open http://localhost:3000 (now running production build with source maps enabled)

**Reproduce the error** (same fast navigation: Assessment → Techniques → Resolution)

**Open DevTools Sources panel:**
- The stack will now show `.tsx` files (not minified chunks)
- Click the first frame that points to your code (not node_modules)
- Paste the file + line number here

---

## Step 3: Once you have the file/line, check for these patterns

### Culprit A: Hook after conditional return

```tsx
// ❌ BAD
if (!data) return null;
const x = useMemo(...);

// ✅ GOOD
const x = useMemo(...);
if (!data) return null;
```

### Culprit B: Hook inside if/loop/try

```tsx
// ❌ BAD
if (ready) {
  useMemo(() => ..., [ready]);
}

// ✅ GOOD
const v = useMemo(() => (ready ? compute() : null), [ready]);
```

### Culprit C: Calling component as function

```tsx
// ❌ BAD
return StepComponent(props);

// ✅ GOOD
return <StepComponent {...props} />;
```

### Culprit D: Redirect during render

```tsx
// ❌ BAD
if (shouldRedirect) router.replace("/x");

// ✅ GOOD
useEffect(() => {
  if (shouldRedirect) router.replace("/x");
}, [shouldRedirect, router]);
return null;
```

---

## What I need from you

**Paste ONE of these:**

1. **Dev console error** with component stack (file + line), OR
2. **Prod stack trace** (first `.tsx` file + line after enabling source maps)

Then we'll apply the **exact fix** to that file/line.

---

## Current fixes applied (may not be the real problem)

- ✅ Resolution link direct to `/chapter/N/proof` (no redirect chain)
- ✅ `/chapter/2/proof` server redirect (no client mount)
- ✅ Removed `useMemo(createClient)` → `getClient()` singleton
- ✅ Assessment: added `isMountedRef` guards
- ✅ Assessment: added `key` to `motion.div` sections
- ✅ Error boundary at `/chapter/error.tsx`

**But these are guesses.** We need the real stack trace to find the actual culprit.
