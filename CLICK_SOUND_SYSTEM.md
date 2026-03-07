# Button Click Sound System

This document describes the button click sound system that provides audio feedback for user interactions throughout the application.

## Overview

The click sound system plays a satisfying click sound (`clicking.mp3`) whenever users interact with buttons, providing immediate tactile-like feedback that enhances the user experience. The system respects the user's sound settings and only plays when sounds are enabled.

## Features

- **Universal Button Sounds**: Consistent audio feedback across all interactive elements
- **User Settings Integration**: Respects the global sound enabled/disabled setting
- **Easy Integration**: Simple hook and function for adding sounds to any button
- **Non-blocking**: Sound playback doesn't interfere with button logic
- **Rapid Click Support**: Allows overlapping sounds for quick successive clicks

## Files Modified/Created

### Core Sound System

1. **`lib/celebration/sounds.ts`**
   - Added `click` sound to the Howl sound registry
   - Created `playClickSound()` function for direct sound playback
   - Volume set to 0.4 for subtle feedback

2. **`lib/hooks/useClickSound.ts`** (NEW)
   - Custom React hook for wrapping button handlers with sound
   - Provides `useClickSound()` hook and `playClick()` helper

### Updated Components

3. **Navigation Buttons**
   - `app/read/[chapterSlug]/[stepSlug]/DynamicStepClient.tsx`
     - Previous, Next, and Complete buttons now play click sounds
   
   - `app/read/[chapterSlug]/DynamicChapterReadingClient.tsx`
     - Previous, Next, and Close buttons now play click sounds

4. **Content Buttons**
   - `components/content/blocks/ButtonBlock.tsx`
     - All content buttons (primary, secondary, outline) play sounds
     - Works for both link-based and action-based buttons

5. **Proof/Resolution Page**
   - `app/chapter/[chapterId]/proof/page.tsx`
     - "Complete Resolution" button plays click sound

## Usage Guide

### Method 1: Using the `useClickSound` Hook (Recommended)

Best for wrapping existing async handlers:

```typescript
import { useClickSound } from '@/lib/hooks/useClickSound'

function MyComponent() {
  const handleSubmitCore = async () => {
    // Your existing logic here
    await saveData()
    router.push('/next-page')
  }
  
  // Wrap with sound
  const handleSubmit = useClickSound(handleSubmitCore)
  
  return <button onClick={handleSubmit}>Submit</button>
}
```

### Method 2: Direct Function Call

Best for simple inline handlers:

```typescript
import { playClickSound } from '@/lib/celebration/sounds'

function MyComponent() {
  return (
    <button onClick={() => {
      playClickSound()
      // Your logic here
    }}>
      Click Me
    </button>
  )
}
```

### Method 3: Using `playClick` Helper

Best for Link components or simple cases:

```typescript
import { playClick } from '@/lib/hooks/useClickSound'

function MyComponent() {
  return <Link href="/page" onClick={playClick}>Go</Link>
}
```

## Sound Asset

- **File**: `public/sounds/clicking.mp3`
- **Volume**: 0.4 (40% - subtle and non-intrusive)
- **Behavior**: Allows overlapping (doesn't stop previous clicks)
- **Preloaded**: Yes, for instant playback

## User Settings

The click sound respects the global `soundEnabled` setting:

- Setting location: `localStorage` key `tcp-settings`
- Toggle component: `components/settings/SoundToggle.tsx`
- Default state: Disabled (user must opt-in)

## Technical Details

### Sound Playback Behavior

Unlike celebration sounds (which stop previous instances), click sounds allow overlapping to support rapid button clicking without audio interruption.

```typescript
export function playClickSound() {
  const settings = getSettings()
  if (!settings.soundEnabled) return
  
  try {
    const sound = sounds.click
    if (sound) {
      // Don't stop - allow overlapping for rapid clicks
      sound.play()
    }
  } catch (error) {
    console.warn('Failed to play click sound:', error)
  }
}
```

### Hook Implementation

The `useClickSound` hook wraps any callback function and plays the sound before executing the callback:

```typescript
export function useClickSound<T extends (...args: any[]) => any>(
  callback?: T
): (...args: Parameters<T>) => ReturnType<T> {
  return useCallback(
    (...args: Parameters<T>) => {
      playClickSound() // Sound plays first
      if (callback) {
        return callback(...args) // Then execute callback
      }
    },
    [callback]
  ) as (...args: Parameters<T>) => ReturnType<T>
}
```

## Adding Click Sounds to New Buttons

### For Component Buttons

```typescript
'use client'
import { useClickSound } from '@/lib/hooks/useClickSound'

export default function MyButton() {
  const handleClickCore = async () => {
    // Your logic
  }
  
  const handleClick = useClickSound(handleClickCore)
  
  return <button onClick={handleClick}>Click</button>
}
```

### For Link-Based Navigation

```typescript
import Link from 'next/link'
import { playClick } from '@/lib/hooks/useClickSound'

export default function MyLink() {
  return <Link href="/page" onClick={playClick}>Navigate</Link>
}
```

### For Inline Handlers

```typescript
import { playClickSound } from '@/lib/celebration/sounds'

<button onClick={() => {
  playClickSound()
  doSomething()
}}>
  Action
</button>
```

## Best Practices

1. **Always respect user settings**: The `playClickSound()` function automatically checks if sounds are enabled
2. **Use the hook for async handlers**: `useClickSound` properly handles async functions
3. **Don't add sounds to hover states**: Only add to actual click/tap interactions
4. **Test on mobile**: Ensure autoplay works on mobile browsers (Howler.js handles this)
5. **Keep volume subtle**: Current volume (0.4) is appropriate for frequent interactions

## Browser Compatibility

- Uses Howler.js for reliable cross-browser audio
- Handles autoplay restrictions on mobile browsers
- Gracefully fails if audio can't be played (no error to user)
- Works on modern browsers: Chrome, Firefox, Safari, Edge

## Performance

- Sound file is preloaded on app initialization
- Playback is instantaneous (no delay)
- Minimal memory footprint (~50KB)
- No network requests after initial load

## Future Enhancements

Potential improvements for the click sound system:

1. **Multiple Click Sounds**: Randomize between 2-3 subtle click variants for variety
2. **Haptic Feedback**: Add optional haptic feedback on mobile devices
3. **Volume Control**: Per-sound-type volume settings
4. **Different Sounds by Button Type**: Different sounds for primary vs secondary buttons
5. **Accessibility**: Add option to replace sounds with visual feedback for hearing-impaired users

## Troubleshooting

### Sound Not Playing

1. Check that sound is enabled in settings:
   ```typescript
   import { getSettings } from '@/lib/settings/userSettings'
   console.log(getSettings().soundEnabled)
   ```

2. Verify the sound file exists:
   - Check `public/sounds/clicking.mp3` is present

3. Check browser console for errors:
   - Look for "Failed to play click sound" warnings

4. Test in different browser:
   - Some browsers have strict autoplay policies

### Sound Plays Multiple Times

This is expected behavior for rapid clicking! Unlike celebration sounds, click sounds are designed to overlap to support fast interactions.

## Summary

The button click sound system provides a polished, Duolingo-like user experience with minimal code changes. By using the `useClickSound` hook or `playClickSound` function, any button can have audio feedback in just one line of code, while respecting user preferences and maintaining high performance.
