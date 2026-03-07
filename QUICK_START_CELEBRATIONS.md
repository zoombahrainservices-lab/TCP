# Quick Start Guide - Celebration System

## What You Need to Do Next

### 1. Add Sound Files (5 minutes)

The celebration system is ready, but you need to add two sound files:

1. **Download free sounds** from these sources:
   - [Mixkit](https://mixkit.co/free-sound-effects/)
   - [FreeSound](https://freesound.org/)
   - [Zapsplat](https://www.zapsplat.com/)

2. **Find these sounds:**
   - `ding.mp3` - A pleasant notification sound (0.5-1 second)
   - `levelup.mp3` - A triumphant celebration sound (1-2 seconds)

3. **Place them here:**
   ```
   tcp-platform/public/sounds/ding.mp3
   tcp-platform/public/sounds/levelup.mp3
   ```

See `public/sounds/README.md` for detailed recommendations.

### 2. Test the System (10 minutes)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test scenarios:**
   - Complete a section for the first time → Should see micro celebration with confetti
   - Complete a section again → Should see "Already completed" toast only
   - Level up → Should see big celebration with "LEVEL UP!" toast
   - Reach streak milestone → Should see big celebration with streak message

3. **Test sound toggle:**
   - Add `<SoundToggle />` to your dashboard or settings page
   - Toggle sound on/off and test celebrations
   - Verify sound plays when enabled, silent when disabled

4. **Test accessibility:**
   - Enable "Reduce motion" in your OS settings
   - Complete a section → Confetti should NOT appear
   - Toasts should still appear normally

### 3. Add Settings UI (Optional, 5 minutes)

Add the sound toggle to your dashboard or profile page:

```typescript
import SoundToggle from '@/components/settings/SoundToggle'

// In your page component:
<div className="p-4">
  <h2 className="text-xl font-bold mb-4">Preferences</h2>
  <SoundToggle />
</div>
```

## What's Already Done ✅

- ✅ Server-side level detection enhanced
- ✅ Celebration engine with queue system
- ✅ User settings with localStorage
- ✅ Sound playback with error handling
- ✅ Confetti animations (micro and big)
- ✅ Custom toasts with react-hot-toast
- ✅ Integration in all completion flows
- ✅ Accessibility support (reduced motion)
- ✅ Rate limiting to prevent spam
- ✅ Smart merging of multiple rewards

## How It Works

When a user completes a section:
1. Server returns `xpResult`, `reasonCode`, and `streakResult`
2. `celebrateSectionCompletion()` evaluates the data
3. Celebrations are queued to prevent overlap
4. Toasts, confetti, and sounds are triggered based on rules
5. Everything respects user preferences and accessibility settings

## File Structure

```
tcp-platform/
├── app/
│   └── actions/
│       └── gamification.ts (Enhanced with oldLevel)
├── lib/
│   ├── celebration/
│   │   └── celebrate.ts (Main celebration engine)
│   └── settings/
│       └── userSettings.ts (Settings management)
├── components/
│   └── settings/
│       └── SoundToggle.tsx (UI toggle for sound)
├── public/
│   └── sounds/
│       ├── README.md (Sound file guide)
│       ├── ding.mp3 (TODO: Add this)
│       └── levelup.mp3 (TODO: Add this)
└── CELEBRATION_SYSTEM_COMPLETE.md (Full documentation)
```

## Troubleshooting

### Confetti not showing
- Check browser console for errors
- Verify `canvas-confetti` is installed: `npm list canvas-confetti`
- Check if "Reduce motion" is enabled in OS settings

### Sound not playing
- Verify sound files exist in `public/sounds/`
- Check if sound is enabled in settings
- Open browser console - autoplay may be blocked (expected)
- Try clicking/interacting with page first (browser requirement)

### Toasts not appearing
- Verify `react-hot-toast` is installed
- Check if `<Toaster />` is in your root layout
- Open browser console for errors

### Level-up not celebrating
- Verify you're actually leveling up (check XP thresholds)
- Check `xpResult.leveledUp` is true in console
- Verify server returns `oldLevel` and `newLevel`

## Need Help?

See the full documentation in `CELEBRATION_SYSTEM_COMPLETE.md` for:
- Detailed implementation guide
- Architecture overview
- API reference
- Testing scenarios
- Future enhancements
