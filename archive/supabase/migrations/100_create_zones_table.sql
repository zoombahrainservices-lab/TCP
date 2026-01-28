-- Create zones table for Zone → Chapter → Phase hierarchy
-- Migration: 100_create_zones_table.sql

CREATE TABLE IF NOT EXISTS zones (
  id BIGSERIAL PRIMARY KEY,
  zone_number INT NOT NULL UNIQUE CHECK (zone_number >= 1 AND zone_number <= 5),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon identifier
  color TEXT, -- hex color for UI theming
  unlock_condition TEXT DEFAULT 'complete_previous_zone',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on zone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_zones_zone_number ON zones(zone_number);

-- Enable RLS
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for zones (public read for authenticated users, admin write)
CREATE POLICY "Authenticated users can view zones"
  ON zones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert zones"
  ON zones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update zones"
  ON zones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete zones"
  ON zones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE zones IS 'Zones organize chapters into thematic groups. 5 zones total.';
COMMENT ON COLUMN zones.zone_number IS 'Sequential zone number (1-5)';
COMMENT ON COLUMN zones.name IS 'Display name of the zone';
COMMENT ON COLUMN zones.icon IS 'Emoji or icon identifier for UI';
COMMENT ON COLUMN zones.color IS 'Hex color code for UI theming';
COMMENT ON COLUMN zones.unlock_condition IS 'Condition for unlocking zone (e.g., complete_previous_zone)';
