-- ============================================================================
-- PlantTree.life — enable realtime on messages
-- Supabase Realtime delivers postgres_changes events only for tables added to
-- the supabase_realtime publication. RLS on messages still applies — donors
-- and farmers only get events for trees they belong to.
-- ============================================================================

alter publication supabase_realtime add table public.messages;
