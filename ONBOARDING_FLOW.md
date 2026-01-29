# Onboarding Flow - Duolingo-Style Experience

## Overview

A frictionless, full-screen onboarding experience that allows users to start immediately without registration. Inspired by Duolingo's approach, this captures user preferences before account creation.

## User Flow

1. **Landing Page** → User clicks "GET STARTED"
2. **Onboarding Page** → User selects their focus area
3. **Registration Page** → User creates account (onboarding data auto-populated)
4. **Dashboard** → User starts training based on their selected focus area

## Focus Areas

Users can choose from 6 communication focus areas:

1. **🧠 Myself** - Focus, confidence, anxiety, honesty
2. **❤️ Friends & Family** - Listening, boundaries, arguments
3. **🎓 School or Work** - Meetings, feedback, teams
4. **📣 Influence & Leadership** - Persuasion, presence, impact
5. **🌍 Complex Situations** - Culture, manipulation, power
6. **🎯 Not sure / Just exploring** - Discover what fits you best

## Features

### Full-Screen Experience
- No scrolling required
- All content visible at once
- Responsive design for all screen sizes
- Duolingo-inspired card layout

### Animations
- Smooth entrance animations for each card (staggered)
- Hover effects with lift and shadow
- Selection animation with checkmark
- Pulsing border effect on selected card
- Floating TCP logo
- Animated gradient background orbs

### Keyboard Navigation
- **Arrow Keys** - Navigate between focus areas
- **Enter/Space** - Select focused area or continue
- **Escape** - Close and return to landing page

### Data Persistence
- Selections stored in localStorage
- Data persists for 7 days
- Automatically cleared after successful registration
- Shown on registration page for context

### Exit Behavior
- **X Button** (top right) - Returns to landing page
- Smoothly scrolls to Problem Section (second section)
- Preserves user's onboarding selection

## Technical Implementation

### Files Created/Modified

**New Files:**
- `app/onboarding/page.tsx` - Onboarding route
- `components/onboarding/OnboardingFlow.tsx` - Main onboarding component
- `lib/onboarding/storage.ts` - LocalStorage utilities

**Modified Files:**
- `components/landing/HeroSection.tsx` - Updated GET STARTED button
- `components/landing/LandingPageWrapper.tsx` - Updated header button
- `components/landing/ProblemSection.tsx` - Added ID for scroll target
- `components/auth/RegisterForm.tsx` - Shows onboarding data

### LocalStorage Schema

```typescript
{
  "onboarding_focus_area": "myself" | "friends-family" | "school-work" | "influence-leadership" | "complex-situations" | "exploring",
  "onboarding_timestamp": "2026-01-28T12:34:56.789Z"
}
```

### Storage Functions

```typescript
// Save user's selection
saveOnboardingData(focusArea: string): void

// Retrieve saved data (null if expired or not found)
getOnboardingData(): OnboardingData | null

// Clear after registration
clearOnboardingData(): void

// Get display name
getFocusAreaName(id: string): string
```

## Design System Integration

### Colors
- Uses TCP brand colors: `#0073ba`, `#4bc4dc`, `#ff6a38`
- Gradient overlays for visual interest
- Dark mode support throughout

### Typography
- Montserrat for headlines
- Lexend for body text
- Bold, clear hierarchy

### Spacing
- Mobile-first responsive design
- Generous padding and margins
- No content overflow

## Future Enhancements

1. **Multi-step Onboarding**
   - Add additional preference screens
   - Skill level assessment
   - Goal setting

2. **Backend Integration**
   - Store focus area in user profile
   - Customize dashboard based on selection
   - Track onboarding completion rates

3. **Enhanced Visuals**
   - Replace emoji with custom illustrations
   - Add vector graphics/icons
   - Animated transitions between steps

4. **Analytics**
   - Track which focus areas are most popular
   - Measure conversion rates
   - A/B test different presentations

## Testing Checklist

- [ ] Click "GET STARTED" from landing page
- [ ] Verify full-screen layout with no scrolling
- [ ] Test all 6 focus area cards
- [ ] Confirm selection animation works
- [ ] Click Continue button
- [ ] Verify data appears on registration page
- [ ] Complete registration
- [ ] Confirm localStorage is cleared
- [ ] Test X button returns to landing page
- [ ] Verify scroll to Problem Section works
- [ ] Test keyboard navigation
- [ ] Test on mobile devices
- [ ] Test dark mode

## Notes

- Currently uses emoji placeholders for images
- LocalStorage data expires after 7 days
- X button redirects to landing page #problem-section
- Data is preserved across browser sessions
- No server-side persistence until registration completes
