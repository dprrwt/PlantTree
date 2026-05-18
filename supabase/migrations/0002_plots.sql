-- ============================================================================
-- PlantTree.life — plot layer
-- Adds the missing core entity: a plot is the actual piece of land where
-- trees grow. A farmer can tend many plots; a plot can have many farmers.
-- Every tree lives on exactly one plot.
-- Run this whole file once in the Supabase SQL editor AFTER 0001_initial.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. plots table
-- ----------------------------------------------------------------------------
create table public.plots (
  id                  text primary key,                           -- slug e.g. 'plot-sunita-naula'
  name                text not null,                              -- local-script name "Naula ke Paas"
  name_en             text not null,                              -- English subtitle "Near the spring"
  village             text not null,
  district_id         text not null references public.districts(id) on delete restrict,
  lat                 numeric(9, 6),
  lng                 numeric(9, 6),
  area_ha             numeric(5, 2),
  elevation_m         integer,
  slope_deg           integer,
  aspect              text,
  water_source        text,
  land_tenure         text check (land_tenure in ('private', 'van-panchayat', 'community', 'lease')),
  panchayat_verified  boolean not null default false,
  soil                jsonb not null default '{}'::jsonb,         -- { N, P, K, pH, OM }
  status              text not null default 'researching' check (status in ('researching', 'field-visited', 'planting')),
  joined_at           text,                                       -- display string like 'Mar 2024'
  trees_planted       integer not null default 0,
  trees_alive         integer not null default 0,
  description         text,
  photo_tone          text check (photo_tone in ('moss', 'terra', 'neutral')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

create index plots_district_idx on public.plots(district_id) where deleted_at is null;
create index plots_status_idx on public.plots(status) where deleted_at is null;

create trigger plots_set_updated_at before update on public.plots
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. farmer_plots junction
-- ----------------------------------------------------------------------------
create table public.farmer_plots (
  farmer_id   text not null references public.farmers(id) on delete cascade,
  plot_id     text not null references public.plots(id) on delete cascade,
  role        text not null default 'primary' check (role in ('primary', 'co-steward')),
  created_at  timestamptz not null default now(),
  primary key (farmer_id, plot_id)
);

create index farmer_plots_plot_idx on public.farmer_plots(plot_id);
create index farmer_plots_role_idx on public.farmer_plots(role);

-- ----------------------------------------------------------------------------
-- 3. trees.plot_id (initially nullable so we can backfill, then locked)
-- ----------------------------------------------------------------------------
alter table public.trees
  add column plot_id text references public.plots(id) on delete restrict;

create index trees_plot_idx on public.trees(plot_id) where deleted_at is null;

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================
alter table public.plots enable row level security;
create policy plots_select_all on public.plots for select using (deleted_at is null or public.is_operator());
create policy plots_write_operator on public.plots for all
  using (public.is_operator()) with check (public.is_operator());

alter table public.farmer_plots enable row level security;
create policy farmer_plots_select_all on public.farmer_plots for select using (true);
create policy farmer_plots_write_operator on public.farmer_plots for all
  using (public.is_operator()) with check (public.is_operator());

-- ============================================================================
-- SEED — the 6 plots from the design extract, verbatim
-- ============================================================================

insert into public.plots
  (id, name, name_en, village, district_id, lat, lng, area_ha, elevation_m,
   slope_deg, aspect, water_source, land_tenure, panchayat_verified, soil,
   status, joined_at, trees_planted, trees_alive, description, photo_tone)
values
  ('plot-sunita-naula', $$Naula ke Paas$$, 'Near the spring',
   'Dhauladevi', 'almora', 29.591, 79.660, 0.8, 1650, 18, 'north-facing',
   'Naula spring · 200m east', 'private', true,
   '{"N":64,"P":38,"K":56,"pH":6.4,"OM":4.2}'::jsonb,
   'planting', 'Mar 2024', 432, 358,
   $$Three terraces above the village naula. South-facing top terrace stays for millet. Banj oak going in on the bottom two, where the spring water can reach.$$,
   'moss'),

  ('plot-saanjha-van', $$Saanjha Van$$, 'Shared forest',
   'Dhauladevi', 'almora', 29.598, 79.667, 4.2, 1720, 32, 'north-east',
   'Seasonal stream · 600m', 'van-panchayat', true,
   '{"N":58,"P":42,"K":60,"pH":6.2,"OM":5.1}'::jsonb,
   'planting', 'Sep 2024', 180, 131,
   $$Community-owned forest patch above the village. The Van Panchayat board signed off; Sunita-ji coordinates planting and the village watches over it together.$$,
   'moss'),

  ('plot-kamla-devta', $$Devta Van$$, $$God's grove$$,
   'Kapkot', 'bageshwar', 29.945, 79.901, 1.6, 1000, 24, 'east-facing',
   'Naula · 80m', 'community', true,
   '{"N":56,"P":36,"K":52,"pH":6.5,"OM":4.8}'::jsonb,
   'planting', 'Oct 2025', 320, 281,
   $$A sacred grove tended for generations by the village. Kamla-ji and the Mahila Mangal Dal are widening it back to its 19th-century footprint.$$,
   'terra'),

  ('plot-dinesh-bada', $$Bada Khet$$, 'The big field',
   'Pabo', 'pauri', 30.143, 78.798, 2.1, 1400, 28, 'south-west',
   'Borewell · on plot', 'private', true,
   '{"N":48,"P":32,"K":50,"pH":5.4,"OM":3.6}'::jsonb,
   'planting', 'Aug 2024', 1280, 940,
   $$A two-hectare slope his grandfather lost to a British-era chir plantation. Dinesh-ji has been pulling out chir and planting native broadleaf for nine years.$$,
   'moss'),

  ('plot-geeta-mahila', $$Mahila Bagh$$, $$Women's orchard$$,
   'Ghansali', 'tehri', 30.434, 78.640, 0.6, 1800, 35, 'south-facing',
   'Hand-pumped · spring 400m', 'community', true,
   '{"N":52,"P":40,"K":56,"pH":6.0,"OM":4.2}'::jsonb,
   'field-visited', 'Feb 2026', 184, 170,
   $$A steep south-facing slope where the Mahila Mangal Dal grows fruit trees + native canopy. Apricot and walnut anchor the slope; bhimal fills the understory.$$,
   'terra'),

  ('plot-mohan-tedha', $$Tedha Dhar$$, 'The crooked ridge',
   'Pipalkoti', 'chamoli', 30.434, 79.452, 1.0, 2400, 42, 'north-facing',
   'Glacial seep · 300m', 'private', true,
   '{"N":38,"P":28,"K":44,"pH":5.8,"OM":3.2}'::jsonb,
   'field-visited', 'Mar 2026', 412, 340,
   $$A 42° slope that started subsiding after 2023. Deodar going in along the contour, roots 9m deep, anchoring what's left of the soil.$$,
   'moss');

-- ----------------------------------------------------------------------------
-- farmer_plots links — Sunita has two, everyone else has one (all primary).
-- coFarmers[] is empty in the design seed; co-stewards can be added later.
-- ----------------------------------------------------------------------------
insert into public.farmer_plots (farmer_id, plot_id, role) values
  ('sunita', 'plot-sunita-naula', 'primary'),
  ('sunita', 'plot-saanjha-van', 'primary'),
  ('kamla',  'plot-kamla-devta', 'primary'),
  ('dinesh', 'plot-dinesh-bada', 'primary'),
  ('geeta',  'plot-geeta-mahila', 'primary'),
  ('mohan',  'plot-mohan-tedha', 'primary');

-- ----------------------------------------------------------------------------
-- BACKFILL — every existing tree gets a plot_id.
--   PT-014, PT-021, PT-027 have explicit plot ids in the design.
--   The 5 trees on Sunita's plot (PT-029, PT-038, PT-047, PT-061, PT-068)
--   default to her primary terraced plot.
-- ----------------------------------------------------------------------------
update public.trees set plot_id = 'plot-sunita-naula' where id = 'PT-014';
update public.trees set plot_id = 'plot-geeta-mahila' where id = 'PT-021';
update public.trees set plot_id = 'plot-kamla-devta'  where id = 'PT-027';

-- Fallback for any tree we missed: pick the farmer's primary plot.
update public.trees t
set plot_id = fp.plot_id
from public.farmer_plots fp
where t.plot_id is null
  and fp.farmer_id = t.farmer_id
  and fp.role = 'primary'
  -- if a farmer has multiple primary plots (Sunita), arbitrarily pick the lex-first
  and fp.plot_id = (
    select min(plot_id) from public.farmer_plots
    where farmer_id = t.farmer_id and role = 'primary'
  );

-- Lock it: every tree now must reference a plot.
alter table public.trees alter column plot_id set not null;
