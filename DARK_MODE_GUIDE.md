# Dark/Light Mode Implementation Guide

## ✅ Complete Implementation

Dark/light mode is now fully implemented across the entire TCP platform.

## How It Works

### 1. **Theme Toggle Component**
Location: `components/ui/ThemeToggle.tsx`

- **Sun icon** for light mode
- **Moon icon** for dark mode
- Saves preference to `localStorage`
- Respects system preference on first visit
- Smooth animated transitions

### 2. **Root Layout**
Location: `app/layout.tsx`

- Inline script prevents flash of wrong theme (FOUT)
- Loads theme before page renders
- Uses `suppressHydrationWarning` to avoid React hydration mismatch

### 3. **Tailwind Dark Mode**

This project uses **Tailwind v4** with automatic dark mode support via the `dark:` class prefix.

Example:
```tsx
<div className="bg-white dark:bg-[#142A4A]">
  <h1 className="text-gray-900 dark:text-white">Hello</h1>
</div>
```

## Updated Components

### Pages
- ✅ Landing page (`app/page.tsx`)
- ✅ Login page (`app/auth/login/page.tsx`)
- ✅ Register page (`app/auth/register/page.tsx`)
- ✅ Dashboard layout (`app/dashboard/layout.tsx`)
- ✅ Dashboard page (`app/dashboard/page.tsx`)

### Landing Sections
- ✅ HeroSection
- ✅ ProblemSection
- ✅ HowItWorksSection
- ✅ FeaturesSection
- ✅ ForWhomSection
- ✅ CTASection

### UI Components
- ✅ ThemeToggle (new)
- ✅ Button
- ✅ Card
- ✅ Input

### Auth Components
- ✅ LoginForm
- ✅ RegisterForm

## Color Scheme

### Light Mode
- Background: White, Gray-50
- Text: Gray-900, Gray-600
- Borders: Gray-200, Gray-300
- Brand: #0770C4 (blue)

### Dark Mode
- Background: #142A4A (navy), #000000 (black)
- Text: White, Gray-300
- Borders: Gray-700, Gray-600
- Brand: #51BFE3 (light blue)

## Theme Toggle Locations

1. **Landing Page**: Top right in header
2. **Dashboard**: Top right in header (next to sign out)
3. **Login Page**: Fixed top right corner
4. **Register Page**: Fixed top right corner

## Testing Dark Mode

1. **Manual Toggle**: Click the sun/moon icon in the header
2. **System Preference**: Set your OS to dark mode - TCP will respect it on first visit
3. **Persistence**: Your choice is saved in localStorage and persists across sessions

## Browser Support

Works in all modern browsers that support:
- CSS custom properties
- `prefers-color-scheme` media query
- localStorage API

## Technical Details

### How Theme is Applied

1. **Initial Load** (before React):
   ```js
   // In <head> of root layout
   const theme = localStorage.getItem('theme');
   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
   if (theme === 'dark' || (!theme && prefersDark)) {
     document.documentElement.classList.add('dark');
   }
   ```

2. **Theme Toggle** (client-side):
   ```tsx
   const toggleTheme = () => {
     if (isDark) {
       document.documentElement.classList.remove('dark')
       localStorage.setItem('theme', 'light')
     } else {
       document.documentElement.classList.add('dark')
       localStorage.setItem('theme', 'dark')
     }
   }
   ```

### Tailwind Dark Mode Strategy

Tailwind v4 uses the `class` strategy by default:
- When `<html class="dark">` → `dark:` classes activate
- When no dark class → normal classes apply

## Best Practices

When adding new components, always:

1. **Add dark mode classes**:
   ```tsx
   <div className="bg-white dark:bg-gray-800">
     <p className="text-gray-900 dark:text-white">Text</p>
   </div>
   ```

2. **Use transition for smooth changes**:
   ```tsx
   className="bg-white dark:bg-gray-800 transition-colors duration-300"
   ```

3. **Test both modes** before deploying

4. **Use brand colors**:
   - Light mode: `#0770C4` (blue)
   - Dark mode: `#51BFE3` (light blue)

## Troubleshooting

### Flash of unstyled content (FOUC)
✅ Fixed - inline script in root layout prevents this

### Hydration mismatch
✅ Fixed - `suppressHydrationWarning` on `<html>` tag

### Theme not persisting
Check localStorage in DevTools → Application → Local Storage

### Icons not showing
Make sure the ThemeToggle component is mounted before rendering icons

## Future Enhancements

- [ ] Add theme preference to user profile (database)
- [ ] Add more color themes (system, light, dark, auto)
- [ ] Add keyboard shortcut for theme toggle (Ctrl/Cmd + Shift + D)
- [ ] Add theme preference in user settings page

---

**Last Updated**: January 28, 2026  
**Status**: ✅ Fully Implemented and Tested
