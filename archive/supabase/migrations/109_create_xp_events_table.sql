-- Create xp_events table for event-based, idempotent XP awarding
-- Migration: 109_create_xp_events_table.sql
-- Provides an audit ledger and prevents duplicate XP awards via unique constraints.

CREATE TABLE IF NOT EXISTS xp_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('PHASE_COMPLETE', 'MISSION_COMPLETE', 'ZONE_COMPLETE')),
  ref_id BIGINT NOT NULL,
  xp_amount INT NOT NULL CHECK (xp_amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, event_type, ref_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_event_type ON xp_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON xp_events(created_at);

-- Enable Row Level Security
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for xp_events (read-only for users; inserts via service role)
CREATE POLICY "Students can view their own xp events"
  ON xp_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Parents can view their children's xp events"
  ON xp_events FOR SELECT
  USING (
    user_id IN (
      SELECT child_id FROM parent_child_links WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all xp events"
  ON xp_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Helper function to compute total XP from the ledger
CREATE OR REPLACE FUNCTION get_total_xp_from_events(target_user_id UUID)
RETURNS INT AS $$
DECLARE
  total_xp INT;
BEGIN
  SELECT COALESCE(SUM(xp_amount), 0)::INT
  INTO total_xp
  FROM xp_events
  WHERE user_id = target_user_id;

  RETURN total_xp;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON TABLE xp_events IS 'Immutable ledger of XP awards. Unique constraint prevents duplicate awards per (user,event_type,ref_id).';
COMMENT ON COLUMN xp_events.user_id IS 'User receiving the XP award';
COMMENT ON COLUMN xp_events.event_type IS 'Type of award: PHASE_COMPLETE, MISSION_COMPLETE, ZONE_COMPLETE';
COMMENT ON COLUMN xp_events.ref_id IS 'Reference id (phase_id, chapter_id, or zone_id depending on event_type)';
COMMENT ON COLUMN xp_events.xp_amount IS 'XP awarded for this event';
