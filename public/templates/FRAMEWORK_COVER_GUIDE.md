# Framework Cover Page - Admin Guide

## Overview
The Framework Cover Page is a special block type that displays as the first full-screen page when users enter a framework step (e.g., SPARK, VOICE).

## Features
- **Full-screen display** with custom background color
- **Large framework acronym** (e.g., SPARK, VOICE)
- **Individual letter cards** showing each letter's meaning
- **Customizable colors** for accent and background
- **Smooth animations** for elegant presentation
- **Continue button** to proceed to framework content

## How to Use in Admin Panel

### Step 1: Create a Framework Step
1. Go to Admin > Chapters > [Your Chapter] > Steps
2. Create a new step with `step_type: "framework"`
3. Give it a title (e.g., "Framework: SPARK")

### Step 2: Add Framework Cover Page
1. Go to the first page of your framework step
2. In the content JSONB editor, add the `framework_cover` block as the **first block**
3. Use one of the templates below

### Template Examples

#### SPARK Framework (Golden/Amber Theme)
```json
{
  "type": "framework_cover",
  "frameworkCode": "SPARK",
  "frameworkTitle": "The SPARK Framework",
  "accentColor": "#f7b418",
  "backgroundColor": "#FFF8E7",
  "letters": [
    {
      "letter": "S",
      "meaning": "Surface the Pattern",
      "color": "#f7b418"
    },
    {
      "letter": "P",
      "meaning": "Pinpoint the Why",
      "color": "#f7b418"
    },
    {
      "letter": "A",
      "meaning": "Anchor to Identity",
      "color": "#f7b418"
    },
    {
      "letter": "R",
      "meaning": "Rebuild with Micro-Commitments",
      "color": "#f7b418"
    },
    {
      "letter": "K",
      "meaning": "Kindle Community",
      "color": "#f7b418"
    }
  ]
}
```

#### VOICE Framework (Green Theme)
```json
{
  "type": "framework_cover",
  "frameworkCode": "VOICE",
  "frameworkTitle": "The VOICE Framework",
  "accentColor": "#10b981",
  "backgroundColor": "#ECFDF5",
  "letters": [
    {
      "letter": "V",
      "meaning": "Validate Your Experience",
      "color": "#10b981"
    },
    {
      "letter": "O",
      "meaning": "Organize Your Thoughts",
      "color": "#10b981"
    },
    {
      "letter": "I",
      "meaning": "Integrate New Patterns",
      "color": "#10b981"
    },
    {
      "letter": "C",
      "meaning": "Connect with Others",
      "color": "#10b981"
    },
    {
      "letter": "E",
      "meaning": "Express Authentically",
      "color": "#10b981"
    }
  ]
}
```

## Customization Options

### Colors
You can customize the appearance using these fields:

- **`accentColor`**: Main color for framework acronym and letter circles
  - Default: `#f7b418` (Golden Amber)
  - Examples: `#10b981` (Green), `#6b21a8` (Purple), `#ff6a38` (Orange)

- **`backgroundColor`**: Page background color
  - Default: `#FFF8E7` (Light Cream)
  - Examples: `#ECFDF5` (Light Green), `#F3E8FF` (Light Purple)

- **`letters[].color`**: Individual color for each letter circle
  - Optional: If not specified, uses `accentColor`
  - Allows different color for each letter

### Text
- **`frameworkCode`**: The acronym (e.g., "SPARK", "VOICE")
- **`frameworkTitle`**: The full title (e.g., "The SPARK Framework")
- **`letters[].letter`**: Single letter (e.g., "S", "P", "A")
- **`letters[].meaning`**: What the letter stands for

## Important Notes

1. **First Block Only**: The `framework_cover` block should be the **first block** in your first framework page
2. **Automatic Display**: When users navigate to the framework step, this cover will show automatically before the content
3. **Navigation**: Users click "Continue" to proceed to the regular framework content
4. **Progress Bar**: The cover page is included in the progress calculation
5. **Previous Button**: From the first content page, users can go back to the cover page

## Color Palette Suggestions

### Framework Colors
- **SPARK** (Energy, Action): `#f7b418` (Golden Amber)
- **VOICE** (Growth, Expression): `#10b981` (Emerald Green)
- **PEACE** (Calm, Balance): `#6366f1` (Indigo Blue)
- **RISE** (Progress, Achievement): `#6b21a8` (Deep Purple)
- **LIGHT** (Clarity, Hope): `#fbbf24` (Warm Yellow)

### Background Colors
- Light Cream: `#FFF8E7`
- Light Green: `#ECFDF5`
- Light Blue: `#EFF6FF`
- Light Purple: `#F3E8FF`
- Light Pink: `#FDF2F8`

## Testing Your Framework Cover

After adding the block:
1. Save the page content
2. Navigate to the framework step in the reading view
3. You should see the full-screen framework cover page first
4. Click "Continue" to see the regular content
5. Click "Previous" from the first content page to go back to the cover

## Troubleshooting

**Cover page not showing?**
- Check that `framework_cover` is the first block in the page content
- Verify `step_type` is set to `"framework"`
- Check for JSON syntax errors in the block

**Colors not working?**
- Ensure color values are valid hex codes (e.g., `#f7b418`)
- Check that the color field is a string with quotes

**Letters not displaying?**
- Verify `letters` is an array
- Check each letter object has both `letter` and `meaning` fields
- Ensure JSON structure matches the template

## Need Help?

Contact the development team or refer to the main documentation for more details about the content management system.
