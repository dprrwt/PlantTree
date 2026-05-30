-- ============================================================================
-- PlantTree.life — verify_token on farmers
-- Mirrors the same pattern as trees (0005): every farmer carries a short
-- opaque token used by the public charter verify URL
--   planttree.life/charter/{farmerId}/{verifyToken}
-- so that printed/posted charters can be authenticated by anyone holding the
-- URL, while raw farmer ids (which are short slugs like "sunita") can't be
-- enumerated to scrape every farmer's charter.
-- ============================================================================

alter table public.farmers
  add column if not exists verify_token text;

update public.farmers
  set verify_token = encode(gen_random_bytes(6), 'hex')
  where verify_token is null;

alter table public.farmers
  alter column verify_token set not null;

create unique index if not exists farmers_verify_token_idx
  on public.farmers(verify_token);
