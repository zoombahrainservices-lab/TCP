# Sound Assets for Celebration System

This directory contains sound files used in the Duolingo-style celebration system.

## Required Sound Files

### ding.mp3
- **Purpose**: Plays on section completion (micro celebration)
- **Duration**: 0.5-1 second
- **Tone**: Pleasant, upbeat ding or chime sound
- **Volume**: Moderate (will be played at 50% volume in code)
- **Suggested sources**:
  - [Mixkit](https://mixkit.co/free-sound-effects/notification/)
  - [FreeSound](https://freesound.org/search/?q=notification%20ding)
  - [Zapsplat](https://www.zapsplat.com/sound-effect-category/notification-sounds/)

### levelup.mp3
- **Purpose**: Plays on level-up (big celebration)
- **Duration**: 1-2 seconds
- **Tone**: Triumphant, celebratory fanfare
- **Volume**: Moderate (will be played at 60% volume in code)
- **Suggested sources**:
  - [Mixkit](https://mixkit.co/free-sound-effects/win/)
  - [FreeSound](https://freesound.org/search/?q=level%20up)
  - [Zapsplat](https://www.zapsplat.com/sound-effect-category/success/)

### streak.mp3 (NEW)
- **Purpose**: Plays on streak milestone (7, 30, 100 days)
- **Duration**: 1-2 seconds
- **Tone**: Warm, rising tone with energy
- **Volume**: Moderate (will be played at 50% volume in code)
- **Suggested sources**:
  - [Mixkit](https://mixkit.co/free-sound-effects/achievement/)
  - [FreeSound](https://freesound.org/search/?q=streak%20fire)
  - Can use same as levelup.mp3 initially

### chapter.mp3 (NEW)
- **Purpose**: Plays on chapter completion (all 6 sections done)
- **Duration**: 2-3 seconds
- **Tone**: Grand, triumphant fanfare
- **Volume**: Louder (will be played at 70% volume in code)
- **Suggested sources**:
  - [Mixkit](https://mixkit.co/free-sound-effects/fanfare/)
  - [FreeSound](https://freesound.org/search/?q=victory%20fanfare)
  - [Zapsplat](https://www.zapsplat.com/sound-effect-category/fanfare/)

## Usage

These sound files are referenced in `/lib/celebration/sounds.ts`:
- `playSound('section')` → ding.mp3
- `playSound('levelup')` → levelup.mp3
- `playSound('streak')` → streak.mp3
- `playSound('chapter')` → chapter.mp3

## User Control

Sound playback can be enabled/disabled by the user through:
- Settings stored in localStorage (`tcp-settings`)
- Toggle component at `/components/settings/SoundToggle.tsx`
- Default: disabled (false)

## Browser Compatibility

The sound system uses Howler.js and handles autoplay restrictions gracefully:
- Preloads all sounds on app start
- Attempts to play sound when user completes an action
- Catches and logs errors if autoplay is blocked
- Does not interrupt user experience if sound fails

## File Requirements

- **Format**: MP3 (best browser compatibility)
- **Size**: Keep under 100KB per file
- **Bitrate**: 128kbps is sufficient
- **Channels**: Mono is fine (reduces file size)
- **Sample Rate**: 44.1kHz standard

## Testing

After adding sound files:
1. Enable sounds in settings
2. Complete a section → Should hear ding.mp3
3. Level up → Should hear levelup.mp3
4. Reach streak milestone → Should hear streak.mp3
5. Complete chapter → Should hear chapter.mp3

## Temporary Placeholders

If you don't have all sound files yet:
- **streak.mp3** can be a copy of `levelup.mp3`
- **chapter.mp3** can be a copy of `levelup.mp3` (or slightly longer/grander version)
- The system will work fine with missing files (silently fails)
