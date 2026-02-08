-- ============================================================================
-- CLEAR YOUR TURN AND PROOF ARTIFACTS (start fresh)
-- ============================================================================
-- Run this in Supabase SQL Editor to delete all "Your Turn" responses and
-- Proof submissions. Use when you want users to re-do proof and your turn
-- without wiping assessments, chapter progress, or other data.
-- ============================================================================

DELETE FROM public.artifacts
WHERE type IN ('your_turn_response', 'proof');
