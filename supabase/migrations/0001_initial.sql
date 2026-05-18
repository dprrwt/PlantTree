-- ============================================================================
-- PlantTree.life — initial schema
-- Run this whole file once in the Supabase SQL editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- updated_at trigger function (used by every mutable table)
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- districts — editorial, slow-changing
-- ----------------------------------------------------------------------------
create table public.districts (
  id            text primary key,
  name          text not null,
  elevation     text not null,
  x             smallint not null,
  y             smallint not null,
  summary       text not null,
  soil          text not null,
  rainfall      text not null,
  species       text[] not null default '{}',
  why           text not null,
  history       text not null,
  field_notes   text not null,
  canopy        smallint not null,
  fire_risk     text not null,
  trees_planted integer not null default 0,
  farmers_count integer not null default 0,
  priority      text not null check (priority in ('critical', 'high', 'medium')),
  status        text not null check (status in ('researching', 'field-visited', 'active', 'coming_next')),
  active_since  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index districts_status_idx on public.districts(status) where deleted_at is null;

create trigger districts_set_updated_at before update on public.districts
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- farmers — verified people; slow-changing
-- ----------------------------------------------------------------------------
create table public.farmers (
  id                   text primary key,
  name                 text not null,
  village              text not null,
  district_id          text not null references public.districts(id) on delete restrict,
  upi                  text not null,
  phone                text not null,
  photo_key            text,
  years                smallint not null default 0,
  plot                 text,
  quote_original       text,
  quote_en             text,
  quote_lang           text default 'hi',
  plants               text[] not null default '{}',
  rate                 integer not null check (rate >= 0),
  rate_care            integer not null check (rate_care >= 0),
  photo_tone           text check (photo_tone in ('moss', 'terra', 'neutral')),
  verified_at          timestamptz,
  verified_by_org      text,
  verification_doc_key text,
  status               text not null default 'active' check (status in ('active', 'pending', 'inactive')),
  trees_planted        integer not null default 0,
  trees_alive          integer not null default 0,
  donors_this_year     integer not null default 0,
  pending_trees        integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz
);

create index farmers_district_idx on public.farmers(district_id) where deleted_at is null;
create index farmers_status_idx on public.farmers(status) where deleted_at is null;

create trigger farmers_set_updated_at before update on public.farmers
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- donors — one row per person who paid; auth_user_id linked after first login
-- ----------------------------------------------------------------------------
create table public.donors (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid references auth.users(id) on delete set null,
  display_name  text not null,
  email         text,
  phone         text,
  city          text,
  is_anonymous  boolean not null default false,
  joined_at     date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create unique index donors_auth_user_id_idx on public.donors(auth_user_id) where auth_user_id is not null;
create index donors_email_idx on public.donors(lower(email)) where email is not null;

create trigger donors_set_updated_at before update on public.donors
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- profiles — bridges auth.users to a role + (optionally) farmer or donor
-- ----------------------------------------------------------------------------
create table public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('donor', 'farmer', 'operator')),
  farmer_id  text references public.farmers(id) on delete set null,
  donor_id   uuid references public.donors(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_farmer_id_idx on public.profiles(farmer_id) where farmer_id is not null;
create index profiles_donor_id_idx on public.profiles(donor_id) where donor_id is not null;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- trees — the core unit. One row per donated tree (PT-XXX).
-- ----------------------------------------------------------------------------
create table public.trees (
  id              text primary key,
  species         text not null,
  scientific_name text not null,
  farmer_id       text not null references public.farmers(id) on delete restrict,
  district_id     text not null references public.districts(id) on delete restrict,
  donor_id        uuid references public.donors(id) on delete set null,
  planted_at      date,
  stage           smallint not null default 0 check (stage between 0 and 4),
  height_m        numeric(4,2) not null default 0,
  health_pct      smallint check (health_pct between 0 and 100),
  visibility      text not null default 'public' check (visibility in ('public', 'private')),
  certifications  jsonb not null default '{}'::jsonb,
  last_update_at  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index trees_farmer_idx on public.trees(farmer_id) where deleted_at is null;
create index trees_donor_idx on public.trees(donor_id) where deleted_at is null;
create index trees_district_idx on public.trees(district_id) where deleted_at is null;

create trigger trees_set_updated_at before update on public.trees
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- donations — the financial record; UPI direct, status-driven
-- ----------------------------------------------------------------------------
create table public.donations (
  id                 uuid primary key default gen_random_uuid(),
  donor_id           uuid not null references public.donors(id) on delete restrict,
  farmer_id          text not null references public.farmers(id) on delete restrict,
  tree_id            text references public.trees(id) on delete set null,
  amount_inr         integer not null check (amount_inr > 0),
  tier               text not null check (tier in ('plant_only', 'plant_care', 'grove_of_5')),
  payment_method     text not null default 'upi_manual' check (payment_method in ('upi_manual', 'razorpay_auto')),
  payment_proof_key  text,
  payment_ref        text,
  status             text not null default 'pending_verify' check (status in (
                       'pending_verify', 'verified', 'awaiting_plant',
                       'planted', 'overdue', 'refunded', 'rejected'
                     )),
  verified_by        uuid references auth.users(id) on delete set null,
  verified_at        timestamptz,
  due_plant_at       timestamptz,
  due_refund_at      timestamptz,
  refunded_at        timestamptz,
  refund_reason      text,
  holdback_amount    integer not null default 0,
  holdback_released_at timestamptz,
  is_anonymous       boolean not null default false,
  recipient_name     text,
  recipient_email    text,
  reveal_at          timestamptz,
  certificate_url    text,
  sponsor_org        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index donations_status_idx on public.donations(status);
create index donations_donor_idx on public.donations(donor_id);
create index donations_farmer_idx on public.donations(farmer_id);
create index donations_due_plant_idx on public.donations(due_plant_at) where status = 'awaiting_plant';
create index donations_due_refund_idx on public.donations(due_refund_at) where status = 'overdue';

create trigger donations_set_updated_at before update on public.donations
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- donation_events — append-only audit log of every status transition
-- ----------------------------------------------------------------------------
create table public.donation_events (
  id           uuid primary key default gen_random_uuid(),
  donation_id  uuid not null references public.donations(id) on delete cascade,
  from_status  text,
  to_status    text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  note         text,
  created_at   timestamptz not null default now()
);

create index donation_events_donation_idx on public.donation_events(donation_id);

-- ----------------------------------------------------------------------------
-- tree_updates — photo + measurements from farmer
-- ----------------------------------------------------------------------------
create table public.tree_updates (
  id                uuid primary key default gen_random_uuid(),
  tree_id           text not null references public.trees(id) on delete cascade,
  posted_by         uuid references auth.users(id) on delete set null,
  photo_key         text,
  caption_original  text,
  caption_en        text,
  caption_lang      text default 'hi',
  height_m          numeric(4,2),
  health_pct        smallint check (health_pct between 0 and 100),
  created_at        timestamptz not null default now()
);

create index tree_updates_tree_idx on public.tree_updates(tree_id);

-- ----------------------------------------------------------------------------
-- milestones — per-tree growth milestones
-- ----------------------------------------------------------------------------
create table public.milestones (
  id           uuid primary key default gen_random_uuid(),
  tree_id      text not null references public.trees(id) on delete cascade,
  label        text not null,
  target_date  text,
  done_at      timestamptz,
  marked_by    uuid references auth.users(id) on delete set null,
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now()
);

create index milestones_tree_idx on public.milestones(tree_id);

-- ----------------------------------------------------------------------------
-- messages — in-app thread per tree (no WhatsApp)
-- ----------------------------------------------------------------------------
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  tree_id         text not null references public.trees(id) on delete cascade,
  from_user_id    uuid references auth.users(id) on delete set null,
  from_role       text not null check (from_role in ('donor', 'farmer', 'system')),
  kind            text not null check (kind in ('text', 'photo', 'thread-open', 'planting', 'milestone')),
  text_original   text,
  text_en         text,
  text_lang       text default 'hi',
  caption_original text,
  caption_en      text,
  photo_key       text,
  photo_tone      text check (photo_tone in ('moss', 'terra', 'neutral')),
  created_at      timestamptz not null default now()
);

create index messages_tree_idx on public.messages(tree_id, created_at);

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================

create or replace function public.is_operator() returns boolean
language sql security definer stable
set search_path = public
as $$
  select coalesce(
    (select role = 'operator' from public.profiles where user_id = auth.uid()),
    false
  );
$$;

create or replace function public.current_farmer_id() returns text
language sql security definer stable
set search_path = public
as $$
  select farmer_id from public.profiles where user_id = auth.uid();
$$;

create or replace function public.current_donor_id() returns uuid
language sql security definer stable
set search_path = public
as $$
  select donor_id from public.profiles where user_id = auth.uid();
$$;

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================

-- districts: fully public read; operator-only write
alter table public.districts enable row level security;
create policy districts_select_all on public.districts for select using (true);
create policy districts_write_operator on public.districts for all
  using (public.is_operator()) with check (public.is_operator());

-- farmers: fully public read (browse page); operator-only write
alter table public.farmers enable row level security;
create policy farmers_select_all on public.farmers for select using (deleted_at is null or public.is_operator());
create policy farmers_write_operator on public.farmers for all
  using (public.is_operator()) with check (public.is_operator());

-- donors: only the donor themselves + operator can read full row
alter table public.donors enable row level security;
create policy donors_select_own on public.donors for select using (
  auth_user_id = auth.uid() or public.is_operator()
);
create policy donors_insert_self on public.donors for insert with check (
  auth_user_id = auth.uid() or public.is_operator()
);
create policy donors_update_own on public.donors for update using (
  auth_user_id = auth.uid() or public.is_operator()
);

-- profiles: a user reads/writes their own; operator can do anything
alter table public.profiles enable row level security;
create policy profiles_select_own on public.profiles for select using (
  user_id = auth.uid() or public.is_operator()
);
create policy profiles_insert_self on public.profiles for insert with check (
  user_id = auth.uid() or public.is_operator()
);
create policy profiles_update_operator on public.profiles for update using (public.is_operator());

-- trees: public can see public trees; farmer sees own; donor sees own; operator sees all
alter table public.trees enable row level security;
create policy trees_select_public on public.trees for select using (
  (deleted_at is null and visibility = 'public')
  or farmer_id = public.current_farmer_id()
  or donor_id = public.current_donor_id()
  or public.is_operator()
);
create policy trees_write_operator on public.trees for all
  using (public.is_operator()) with check (public.is_operator());

-- donations: donor sees own; farmer sees own (amounts they earned); operator sees all
alter table public.donations enable row level security;
create policy donations_select_own on public.donations for select using (
  donor_id = public.current_donor_id()
  or farmer_id = public.current_farmer_id()
  or public.is_operator()
);
create policy donations_insert_donor on public.donations for insert with check (
  donor_id = public.current_donor_id() or public.is_operator()
);
create policy donations_update_operator on public.donations for update using (public.is_operator());

-- donation_events: only operator + the donor of the donation
alter table public.donation_events enable row level security;
create policy donation_events_select on public.donation_events for select using (
  public.is_operator()
  or exists (
    select 1 from public.donations d
    where d.id = donation_id and d.donor_id = public.current_donor_id()
  )
);
create policy donation_events_insert_operator on public.donation_events for insert
  with check (public.is_operator());

-- tree_updates: public read (donor's tree page is shareable); farmer-or-operator write
alter table public.tree_updates enable row level security;
create policy tree_updates_select_all on public.tree_updates for select using (true);
create policy tree_updates_insert_farmer on public.tree_updates for insert with check (
  posted_by = auth.uid() and (
    public.is_operator()
    or exists (
      select 1 from public.trees t
      where t.id = tree_id and t.farmer_id = public.current_farmer_id()
    )
  )
);

-- milestones: public read; farmer/operator write
alter table public.milestones enable row level security;
create policy milestones_select_all on public.milestones for select using (true);
create policy milestones_write on public.milestones for all using (
  public.is_operator()
  or exists (
    select 1 from public.trees t
    where t.id = tree_id and t.farmer_id = public.current_farmer_id()
  )
) with check (
  public.is_operator()
  or exists (
    select 1 from public.trees t
    where t.id = tree_id and t.farmer_id = public.current_farmer_id()
  )
);

-- messages: thread participants + operator only
alter table public.messages enable row level security;
create policy messages_select_participants on public.messages for select using (
  public.is_operator()
  or exists (
    select 1 from public.trees t
    where t.id = tree_id
      and (t.farmer_id = public.current_farmer_id() or t.donor_id = public.current_donor_id())
  )
);
create policy messages_insert_participants on public.messages for insert with check (
  from_user_id = auth.uid() and (
    public.is_operator()
    or exists (
      select 1 from public.trees t
      where t.id = tree_id
        and (t.farmer_id = public.current_farmer_id() or t.donor_id = public.current_donor_id())
    )
  )
);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
insert into storage.buckets (id, name, public) values
  ('tree-photos',    'tree-photos',    true),
  ('farmer-photos',  'farmer-photos',  true),
  ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- ============================================================================
-- SEED DATA — pulled from lib/data.ts
-- ============================================================================

-- Districts
insert into public.districts
  (id, name, elevation, x, y, summary, soil, rainfall, species, why, history, field_notes,
   canopy, fire_risk, trees_planted, farmers_count, priority, status, active_since)
values
  ('almora', 'Almora', '1,650 m', 62, 48,
   $$Banj oak forests being lost to flammable chir pine — and with them, the springs.$$,
   'Brown forest soil, mid-slope', '1,100 mm · monsoon-fed',
   array['Banj oak', 'Buransh', 'Kafal'],
   $$Banj oak (Quercus leucotrichophora) holds groundwater. Where oak is replaced by chir pine, naula springs go dry within a generation.$$,
   $$Once dense banj oak forest, replaced post-1960s by chir pine for resin tapping. Local naula springs began drying by the early 2000s. Communities have organized Van Panchayats to reverse this.$$,
   $$Visited Feb ' Apr & Sep 2024, Mar 2025. Sunita-ji's plot is the most established — used as reference site for the rest of the district.$$,
   32, 'low (oak canopy returning)', 1840, 6, 'high', 'active', 'Mar 2024'),

  ('bageshwar', 'Bageshwar', '1,000 m', 72, 36,
   'Reviving sacred groves around naula springs that feed three valleys.',
   'Loamy, terraced', '1,400 mm',
   array['Buransh', 'Tilonj oak', 'Kharsu oak'],
   $$Mixed oak forests above villages directly recharge stone-cut spring channels — the only year-round water source for upper-Himalayan hamlets.$$,
   $$Sacred groves (devta van) kept these slopes forested even when adjacent valleys were cleared. The naula spring system is documented since the 18th century. Restoration here is about widening protected fragments, not starting from bare land.$$,
   $$Visited Nov 2025 with Hark Foundation. Two panchayats signed letters of intent. First planting cycle starts post-monsoon 2026.$$,
   41, 'low', 920, 3, 'high', 'field-visited', 'Oct 2025'),

  ('tehri', 'Tehri Garhwal', '1,800 m', 28, 56,
   $$Slope stabilization above the Tehri reservoir + fruit-tree income for women's collectives.$$,
   'Mountain soil, landslide-prone', '1,000 mm',
   array['Walnut', 'Apricot', 'Bhimal', 'Banj oak'],
   $$Deep-rooted natives + fruit trees hold the slope AND produce sellable harvests — a forest you can eat.$$,
   $$Massive land disturbance from the 2010s onwards — Tehri dam construction and slope failures. Many of the original forests above the reservoir are gone. Reforestation here is also slope-stabilization.$$,
   $$Geeta-ji's Mahila Mangal Dal hosted us. Pilot of 50 trees scheduled for Jun 2026.$$,
   22, 'medium', 1240, 4, 'medium', 'field-visited', 'Feb 2026'),

  ('chamoli', 'Chamoli', '2,400 m', 46, 26,
   'Post-Joshimath: planting on subsidence-affected slopes around the holy belt.',
   'Disturbed, shallow', '1,200 mm · snow-influenced',
   array['Deodar', 'Kharsu oak', 'Bhojpatra'],
   $$Deodar (Cedrus deodara) roots 9m deep — one of the few species that can knit unstable Himalayan slopes back together.$$,
   $$The 2023 Joshimath subsidence revealed how shallow and unstable many of these slopes have become. Reforestation is part of a much larger geological intervention that has to happen at the same time.$$,
   $$Two desk reviews so far. Awaiting a site visit with the Wadia Institute geologists before we commit to a planting plan.$$,
   14, 'high', 520, 2, 'critical', 'researching', null),

  ('pauri', 'Pauri Garhwal', '1,400 m', 36, 64,
   'Replacing colonial chir pine monoculture with native broadleaf forest.',
   'Acidic from pine needles, recoverable', '1,100 mm',
   array['Banj oak', 'Bhimal', 'Buransh'],
   $$Chir pine plantations (planted by the British for railway sleepers) drop tinder-dry needles every summer. Almost every forest fire you read about starts in chir. Native oak doesn't burn the same way.$$,
   $$The British forest dept replaced native oak with chir pine here in the 1880s to supply railway sleepers. The needle-drop changed soil chemistry, the canopy stopped recharging springs, and the fire frequency tripled. We're peeling that mistake back, one acre at a time.$$,
   $$Dinesh-ji's plot is the most aggressive replacement effort. The Forest Department gave us a no-objection certificate after the first year's data.$$,
   26, 'high (chir-dominated)', 1560, 4, 'high', 'active', 'Aug 2024'),

  ('pithoragarh', 'Pithoragarh', '1,500 m', 84, 42,
   'Border-district revival — high-altitude fruit + medicinal trees.',
   'Mountain loam, well-drained', '1,500 mm',
   array['Walnut', 'Kafal', 'Timur'],
   $$Migration is hollowing out these villages. A walnut tree pays back ₹4,000–₹8,000/yr after year 6 — a reason to stay.$$,
   $$Border district. Outmigration is so severe that many villages are 80% empty — the soil is fine, the people aren't there. Any tree program here also has to be a 'reason to stay' program.$$,
   $$Phone calls with three village heads. No site visit yet — logistics are hard. Targeting first visit Sep 2026.$$,
   38, 'medium', 380, 2, 'medium', 'researching', null);

-- "Coming next" districts (no detailed data yet)
insert into public.districts
  (id, name, elevation, x, y, summary, soil, rainfall, species, why, history, field_notes,
   canopy, fire_risk, priority, status)
values
  ('uttarkashi',  'Uttarkashi',       '2,000 m', 18, 30, 'Bhagirathi basin · deodar revival', '—', '—', '{}', '—', '—', '—', 0, '—', 'medium', 'coming_next'),
  ('rudraprayag', 'Rudraprayag',      '1,500 m', 40, 38, 'Mandakini valley · post-2013 floods', '—', '—', '{}', '—', '—', '—', 0, '—', 'medium', 'coming_next'),
  ('champawat',   'Champawat',        '1,600 m', 90, 60, 'Border Kumaon · mixed oak', '—', '—', '{}', '—', '—', '—', 0, '—', 'medium', 'coming_next'),
  ('nainital',    'Nainital (rural)', '2,000 m', 70, 70, 'Lake basin recharge zones', '—', '—', '{}', '—', '—', '—', 0, '—', 'medium', 'coming_next');

-- Farmers
insert into public.farmers
  (id, name, village, district_id, upi, phone, years, plot,
   quote_original, quote_en, plants, rate, rate_care, photo_tone,
   verified_by_org, verified_at, status,
   trees_planted, trees_alive, donors_this_year, pending_trees)
values
  ('sunita', 'Sunita Devi', 'Dhauladevi, Almora', 'almora',
   'sunita.devi@oksbi', '+91 9XXXX 12480', 7, '0.8 ha · terraced',
   $$Mere bachpan mein naula nahi sookhta tha. Ab jeth mein hi sookh jaata hai. Ham wapas banj laga rahe hain — taaki paani wapas aaye.$$,
   $$When I was a child the spring never went dry. Now it's dry by May. We're planting banj oak back — so the water comes back.$$,
   array['Banj oak', 'Buransh', 'Kafal'], 500, 1500, 'moss',
   'Hark Foundation, Almora', '2024-03-01 00:00:00+05:30', 'active',
   612, 489, 34, 18),

  ('kamla', 'Kamla Bisht', 'Kapkot, Bageshwar', 'bageshwar',
   'kamla.bisht@ybl', '+91 9XXXX 84102', 4, '1.2 ha + community grove',
   $$Mahila samiti ke saath kaam karte hain. Saamne wala naula ab phir se chal raha hai.$$,
   $$We work as a women's collective. The naula across from us is flowing again.$$,
   array['Tilonj oak', 'Buransh', 'Kharsu oak'], 500, 1500, 'terra',
   'Panchayat resolution + Van Panchayat', '2025-10-01 00:00:00+05:30', 'active',
   320, 281, 18, 6),

  ('dinesh', 'Dinesh Negi', 'Pabo, Pauri', 'pauri',
   'dineshnegi.up@upi', '+91 9XXXX 02148', 9, '2.1 ha · ex-chir plantation',
   $$Chir to angrez laga gaye the. Ab hamari baari hai jungle wapas lagaane ki — asli waala.$$,
   $$The British planted chir pine. It's our turn now to plant the real forest back.$$,
   array['Banj oak', 'Bhimal', 'Buransh'], 400, 1200, 'moss',
   'Forest Dept. NOC + Van Panchayat', '2024-08-01 00:00:00+05:30', 'active',
   1280, 940, 52, 24),

  ('geeta', 'Geeta Rawat', 'Ghansali, Tehri', 'tehri',
   'geeta.rawat@paytm', '+91 9XXXX 71024', 3, '0.6 ha',
   $$Khubani aur akhrot ek saath laga rahe hain — ki phal bhi mile, mitti bhi rake.$$,
   $$We plant apricot with walnut — fruit to sell, roots to hold the slope.$$,
   array['Walnut', 'Apricot', 'Bhimal'], 800, 2200, 'terra',
   'Mahila Mangal Dal', '2026-02-01 00:00:00+05:30', 'active',
   184, 170, 12, 9),

  ('mohan', 'Mohan Singh Bhandari', 'Pipalkoti, Chamoli', 'chamoli',
   'mohanbhandari@oksbi', '+91 9XXXX 33960', 6, '1.0 ha · slope >40°',
   $$Joshimath ke baad sab dar gaye the. Deodar ki jaden 9 meter neeche jaati hain — yahi pakad rakhega.$$,
   $$After Joshimath everyone was afraid. Deodar's roots go 9 meters deep — that's what will hold us.$$,
   array['Deodar', 'Kharsu oak'], 600, 1800, 'moss',
   'Disaster Mgmt. Authority listing', null, 'active',
   412, 340, 21, 14);

-- Placeholder donors (for visual continuity until real auth users sign up)
insert into public.donors (id, display_name, city, joined_at) values
  ('00000000-0000-0000-0000-000000000001', 'Aditya',   'Bengaluru', '2026-03-01'),
  ('00000000-0000-0000-0000-000000000002', 'Sarah P.', 'Mumbai',    '2026-04-10'),
  ('00000000-0000-0000-0000-000000000003', 'Maja K.',  'Delhi',     '2026-04-15'),
  ('00000000-0000-0000-0000-000000000004', 'Ravi C.',  'Pune',      '2026-04-20'),
  ('00000000-0000-0000-0000-000000000005', 'Megha R.', 'Chennai',   '2026-05-05'),
  ('00000000-0000-0000-0000-000000000006', 'Anonymous','—',         '2026-05-01');

-- Trees (Aditya's grove: 3 trees across 3 districts)
insert into public.trees
  (id, species, scientific_name, farmer_id, district_id, donor_id,
   planted_at, stage, height_m, health_pct, last_update_at)
values
  ('PT-014', 'Banj oak',  'Quercus leucotrichophora', 'sunita', 'almora',    '00000000-0000-0000-0000-000000000001', '2026-04-08', 2, 0.8, 92,  '2026-05-13 00:00:00+05:30'),
  ('PT-021', 'Walnut',    'Juglans regia',            'geeta',  'tehri',     '00000000-0000-0000-0000-000000000001', '2026-04-22', 1, 0.3, 95,  '2026-05-17 00:00:00+05:30'),
  ('PT-027', 'Buransh',   'Rhododendron arboreum',    'kamla',  'bageshwar', '00000000-0000-0000-0000-000000000001', '2026-05-04', 0, 0.0, 100, '2026-05-18 00:00:00+05:30');

-- Additional trees on Sunita-ji's plot (for the farmer workspace)
insert into public.trees
  (id, species, scientific_name, farmer_id, district_id, donor_id,
   planted_at, stage, height_m, health_pct, last_update_at)
values
  ('PT-029', 'Buransh',  'Rhododendron arboreum', 'sunita', 'almora', '00000000-0000-0000-0000-000000000002', '2026-04-12', 1, 0.6, 88,  '2026-05-04 00:00:00+05:30'),
  ('PT-038', 'Banj oak', 'Quercus leucotrichophora', 'sunita', 'almora', '00000000-0000-0000-0000-000000000003', '2026-04-18', 1, 0.5, 95,  '2026-04-27 00:00:00+05:30'),
  ('PT-047', 'Kafal',    'Myrica esculenta',      'sunita', 'almora', '00000000-0000-0000-0000-000000000004', '2026-04-22', 0, 0.3, 90,  '2026-04-27 00:00:00+05:30'),
  ('PT-061', 'Banj oak', 'Quercus leucotrichophora', 'sunita', 'almora', '00000000-0000-0000-0000-000000000005', '2026-05-08', 0, 0.2, 100, '2026-05-17 00:00:00+05:30'),
  ('PT-068', 'Banj oak', 'Quercus leucotrichophora', 'sunita', 'almora', '00000000-0000-0000-0000-000000000001', null,          0, 0.0, null, null);

-- Donations corresponding to Aditya's grove
insert into public.donations
  (donor_id, farmer_id, tree_id, amount_inr, tier, payment_method, status, verified_at, is_anonymous)
values
  ('00000000-0000-0000-0000-000000000001', 'sunita', 'PT-014', 1500, 'plant_care', 'upi_manual', 'planted', '2026-04-04 10:42:00+05:30', false),
  ('00000000-0000-0000-0000-000000000001', 'geeta',  'PT-021', 2200, 'plant_care', 'upi_manual', 'planted', '2026-04-22 11:08:00+05:30', false),
  ('00000000-0000-0000-0000-000000000001', 'kamla',  'PT-027', 800,  'plant_only', 'upi_manual', 'planted', '2026-05-04 08:12:00+05:30', false);

-- Milestones for PT-014 (Aditya's banj oak)
insert into public.milestones (tree_id, label, target_date, done_at, sort_order) values
  ('PT-014', 'Planted by Sunita-ji',         $$Apr 08 '26$$, '2026-04-08 07:14:00+05:30', 0),
  ('PT-014', 'Survived first month',          $$May 09 '26$$, '2026-05-09 06:30:00+05:30', 1),
  ('PT-014', 'Through the monsoon',           'Oct 2026',     null, 2),
  ('PT-014', 'First dry season cleared',      'May 2027',     null, 3),
  ('PT-014', 'First acorn drop',              '2030',         null, 4);

-- Photo updates for PT-014
insert into public.tree_updates (tree_id, photo_key, caption_en, caption_lang, height_m, health_pct, created_at) values
  ('PT-014', 'tree-photos/PT-014/2026-04-08.jpg', 'Day 1 — sapling in the ground', 'en', 0.3, 100, '2026-04-08 07:14:00+05:30'),
  ('PT-014', 'tree-photos/PT-014/2026-04-22.jpg', 'First leaves opening',          'en', 0.5, 95,  '2026-04-22 09:00:00+05:30'),
  ('PT-014', 'tree-photos/PT-014/2026-05-09.jpg', 'After the first big rain',      'en', 0.8, 92,  '2026-05-09 06:31:00+05:30');

-- Messages for PT-014 (Aditya ↔ Sunita-ji)
insert into public.messages (tree_id, from_role, kind, text_original, text_en, text_lang, created_at) values
  ('PT-014', 'system', 'thread-open', null, 'Thread opened. ₹1,500 paid to Sunita-ji · banj oak · plant + 1 yr care', 'en', '2026-04-04 10:42:00+05:30'),
  ('PT-014', 'donor',  'text',  'Namaste Sunita-ji. Looking forward to seeing the tree grow.', 'Namaste Sunita-ji. Looking forward to seeing the tree grow.', 'en', '2026-04-04 10:43:00+05:30'),
  ('PT-014', 'farmer', 'text',  $$Namaste. Payment mil gaya. Saplings nursery se aaj la raha hoon — kal subah lagaa dunga.$$, 'Namaste. Payment received. Bringing saplings from the nursery today — will plant tomorrow morning.', 'hi', '2026-04-04 18:20:00+05:30'),
  ('PT-014', 'system', 'planting', null, 'Sunita-ji marked the tree as planted', 'en', '2026-04-08 07:14:00+05:30'),
  ('PT-014', 'farmer', 'photo',  $$Lag gaya hai. Mitti gili hai aaj subah — acchi shuruaat.$$, 'It is planted. The soil is wet this morning — a good start.', 'hi', '2026-04-08 07:14:00+05:30'),
  ('PT-014', 'donor',  'text',  'Bahut sundar ji. Thank you so much.', 'Very beautiful ji. Thank you so much.', 'hi', '2026-04-08 09:01:00+05:30'),
  ('PT-014', 'system', 'milestone', null, 'Milestone reached · Survived first month', 'en', '2026-05-09 06:30:00+05:30'),
  ('PT-014', 'farmer', 'photo',  $$First big rain. Patti khul rahi hai — leaves are opening.$$, 'First big rain. Leaves are opening.', 'hi', '2026-05-09 06:31:00+05:30'),
  ('PT-014', 'farmer', 'text',  'Height ab 0.4m. Sab theek hai.', 'Height is 0.4m now. All is well.', 'hi', '2026-05-09 06:32:00+05:30');

-- Messages for PT-021 (Aditya ↔ Geeta-ji)
insert into public.messages (tree_id, from_role, kind, text_en, text_lang, created_at) values
  ('PT-021', 'system', 'thread-open', 'Thread opened. ₹2,200 paid to Geeta-ji · walnut · plant + 1 yr care', 'en', '2026-04-22 11:08:00+05:30'),
  ('PT-021', 'farmer', 'text',        'Received ji. Walnut saplings collected from the nursery. Planting tomorrow.', 'en', '2026-04-23 09:14:00+05:30'),
  ('PT-021', 'system', 'planting',    'Geeta-ji marked the tree as planted', 'en', '2026-04-24 16:40:00+05:30');

-- Messages for PT-027 (Aditya ↔ Kamla-ji)
insert into public.messages (tree_id, from_role, kind, text_en, text_lang, created_at) values
  ('PT-027', 'system', 'thread-open', 'Thread opened. ₹800 paid to Kamla-ji · buransh · plant only', 'en', '2026-05-04 08:12:00+05:30'),
  ('PT-027', 'farmer', 'text',        'Namaste ji. Sapling ready — planting this evening.', 'en', '2026-05-04 10:34:00+05:30'),
  ('PT-027', 'system', 'planting',    'Kamla-ji marked the tree as planted', 'en', '2026-05-04 17:50:00+05:30');
