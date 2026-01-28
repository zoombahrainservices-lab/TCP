-- Rename Zone 1 to "THE ATTENTION HEIST"
-- Migration: 110_rename_zone1_attention_heist.sql
-- Date: 2026-01-28

-- Update Zone 1 name and description to match Mission 1 theme
UPDATE zones SET 
  name = 'THE ATTENTION HEIST',
  description = 'Reclaiming Your Focus from the Digital Void - Days 1-7',
  color = '#FF2D2D'
WHERE zone_number = 1;

-- Verify the update
SELECT zone_number, name, description, icon, color 
FROM zones 
WHERE zone_number = 1;
