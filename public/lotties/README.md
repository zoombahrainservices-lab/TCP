# Lottie Animation Assets for Celebration System

This directory contains Lottie JSON animation files for the ultra-premium celebration system.

## Current Files

### Placeholder Animations (Basic)

The following files are **simple placeholder animations** created for initial testing:

1. **`section-burst.json`** - Basic sparkle burst for section completion
2. **`streak-flame.json`** - Simple flame animation for streak milestones
3. **`levelup-shine.json`** - Trophy animation for level-ups
4. **`chapter-trophy.json`** - Star trophy for chapter completion

These work but are minimal. For a true Duolingo-style experience, replace them with premium animations.

## Recommended: Premium Lottie Animations

For the best user experience, download high-quality Lottie animations from:

### Free Sources
- **[LottieFiles](https://lottiefiles.com/)** - Thousands of free animations
- **[LordIcon](https://lordicon.com/)** - Premium animated icons
- **[IconScout](https://iconscout.com/lottie-animations)** - Curated collection

### Recommended Searches

**For section completion:**
- Search: "sparkle burst", "confetti", "success check"
- Style: Subtle, quick (1-2s duration)
- Colors: Match per-section theming (blue, purple, teal, etc.)

**For streak milestones:**
- Search: "fire flame", "streak", "hot"
- Style: Animated flame with warm glow
- Duration: 2-3s loop

**For level-up:**
- Search: "trophy", "medal", "achievement", "star"
- Style: Bold, celebratory with shine/sparkle
- Duration: 2-3s

**For chapter completion:**
- Search: "trophy celebration", "badge", "award", "success"
- Style: Large, impressive, triumphant
- Duration: 3-4s

## How to Replace

1. Download your chosen Lottie JSON file
2. Rename it to match the current filename (e.g., `section-burst.json`)
3. Replace the file in this directory
4. The app will automatically use the new animation

## File Requirements

- **Format**: Lottie JSON (.json)
- **Size**: Keep under 200KB per file for fast loading
- **Duration**: 1-4 seconds depending on celebration type
- **Looping**: Can be looping or one-shot (component handles both)
- **Colors**: Transparent background recommended

## Testing

After adding new animations:
1. Complete a section → Should see new section-burst animation
2. Reach streak milestone → Should see new streak-flame animation
3. Level up → Should see new levelup-shine animation
4. Complete all 6 sections → Should see new chapter-trophy animation

## Using the Player

The animations are rendered using `@lottiefiles/react-lottie-player` with:
- Autoplay enabled
- Loop enabled
- Fallback emoji if file fails to load

## Optimization Tips

1. **Reduce file size**: Use LottieFiles optimizer
2. **Test on mobile**: Ensure smooth playback on all devices
3. **Consider reduced motion**: Fallback emojis are shown if user prefers reduced motion
4. **Preload**: Files are loaded on-demand but cached by browser

## Custom Creation

To create custom Lottie animations:
1. Design in Adobe After Effects
2. Export with Bodymovin plugin
3. Or use **[LottieFiles Creator](https://creator.lottiefiles.com/)** (web-based)

## Current Theme Colors

Per-section theming in the celebration overlay:
- **Reading**: Blue/Cyan (`from-blue-500/20 to-cyan-500/20`)
- **Assessment**: Purple/Pink (`from-purple-500/20 to-pink-500/20`)
- **Framework**: Teal/Green (`from-teal-500/20 to-green-500/20`)
- **Techniques**: Green/Emerald (`from-green-500/20 to-emerald-500/20`)
- **Proof**: Orange/Amber (`from-orange-500/20 to-amber-500/20`)
- **Follow-through**: Yellow/Gold (`from-yellow-500/20 to-gold-500/20`)

Consider matching your Lottie animation colors to these themes for a cohesive experience.
