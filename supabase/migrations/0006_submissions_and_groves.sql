-- ============================================================================
-- PlantTree.life — public contributions + public grove registry
-- Run this whole file once in the Supabase SQL editor AFTER 0005_verify_token.sql.
--
-- Adds:
--   1. submissions — plots/farmers contributed from the public, no-auth /contribute
--      form. Rows stay status='new' and invisible to the public site until an
--      operator promotes them into the researching → field-visited → planting
--      lifecycle.
--   2. donors.is_public — opt-in flag the /groves registry filters on. A donor
--      can make their grove publicly viewable (trees & growth only).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. submissions — public contribution queue
-- ----------------------------------------------------------------------------
-- Reference ids are allocated atomically by a sequence (SUB-1001, SUB-1002, …).
-- The server action inserts without an id and reads back the generated value —
-- no racy "select max()+1", so concurrent public submissions can't collide.
create sequence if not exists public.submissions_ref_seq start with 1001;

create table public.submissions (
  id                text primary key default ('SUB-' || nextval('public.submissions_ref_seq')), -- e.g. "SUB-1042"
  contributor_type  text,                             -- resident|farmer|ngo|panchayat|other
  contributor_name  text,
  phone             text,                             -- OTP-verified; no account created
  org_name          text,
  org_reg           text,
  org_role          text,
  org_doc_url       text,
  adding            text not null default 'both' check (adding in ('plot', 'farmer', 'both')),
  district          text,
  village           text,
  lat               numeric(9, 6),
  lng               numeric(9, 6),
  land_size         text,
  water             text,
  land_state        text,
  owner             text,
  photo_url         text,
  farmer_name       text,
  farmer_agreed     text,                             -- yes|notyet
  note              text,
  trust             text[] not null default '{}',     -- denormalised signals for triage
  status            text not null default 'new' check (status in ('new', 'promoted', 'dismissed')),
  promoted_plot_id   text references public.plots(id) on delete set null,
  promoted_farmer_id text references public.farmers(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index submissions_status_idx on public.submissions(status);
create index submissions_phone_idx on public.submissions(phone);

create trigger submissions_set_updated_at before update on public.submissions
  for each row execute function public.set_updated_at();

-- RLS: operator-only read/write. The public /contribute form writes through the
-- service-role admin client (server action), which bypasses RLS, so no public
-- insert policy is granted here — rows are never readable by the public site.
-- Production hardening: rate-limit inserts by phone/IP in the server action.
alter table public.submissions enable row level security;
create policy submissions_operator_all on public.submissions for all
  using (public.is_operator()) with check (public.is_operator());

-- ----------------------------------------------------------------------------
-- 2. donors.is_public — opt-in public grove
-- ----------------------------------------------------------------------------
alter table public.donors
  add column is_public boolean not null default false;

create index donors_is_public_idx on public.donors(is_public) where is_public = true and deleted_at is null;

-- NB: we deliberately do NOT add a public SELECT policy on donors. Postgres RLS
-- is row-level, not column-level, so a "where is_public = true" policy would
-- expose the whole row — email, phone, city, auth_user_id — to the anon key.
-- The /groves registry reads through the service-role admin client
-- (lib/db/groves-queries.ts) which bypasses RLS and selects only the safe
-- columns. If a direct browser read is ever needed, expose a column-restricted
-- view / SECURITY DEFINER RPC instead of opening the table.

-- ----------------------------------------------------------------------------
-- Seed — make two demo donors' groves public so the registry isn't empty.
--   Aditya  (…0001) — 3 trees across 3 districts
--   Sarah P.(…0002) — 1 tree on Sunita-ji's plot
-- ----------------------------------------------------------------------------
update public.donors set is_public = true
  where id in (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002'
  );
