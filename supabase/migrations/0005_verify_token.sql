-- ============================================================================
-- PlantTree.life — verify_token on trees
-- Every tree carries a short opaque token so the cert + receipt's printed
-- verify URLs (planttree.life/cert/{treeId}/{token}) resist enumeration.
-- Without this, anyone could iterate PT-001, PT-002, … and pull receipts
-- they shouldn't see. With it, the token is the secret; the tree id is just
-- a human-readable handle.
-- ============================================================================

alter table public.trees
  add column if not exists verify_token text;

-- Backfill existing trees with a fresh random token. 6 random bytes → 12 hex
-- chars; ~10^14 possibilities, more than enough to defeat enumeration.
update public.trees
  set verify_token = encode(gen_random_bytes(6), 'hex')
  where verify_token is null;

alter table public.trees
  alter column verify_token set not null;

create unique index if not exists trees_verify_token_idx
  on public.trees(verify_token);
