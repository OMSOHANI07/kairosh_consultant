-- =============================================================================
-- Kairosh Consultants — database schema for Neon (Postgres + Data API + Auth)
--
-- Run this once in the Neon SQL Editor (or psql) on the database that has the
-- Data API and Managed Better Auth enabled. It is idempotent: safe to re-run.
--
-- Roles (created by Neon when the Data API is enabled):
--   anonymous      -> requests from visitors who are not signed in
--   authenticated  -> requests carrying a signed-in user's JWT
-- auth.user_id()   -> the `sub` claim of the request JWT (neon_auth.user.id)
-- =============================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.admins (
  email      citext primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id             uuid primary key default gen_random_uuid(),
  email          citext unique,
  phone          text unique,
  phone_verified boolean not null default false,
  auth_user_id   uuid unique,
  created_at     timestamptz not null default now(),
  last_login     timestamptz not null default now(),
  constraint customers_identity check (email is not null or phone is not null)
);

create table if not exists public.visitors (
  id             uuid primary key,
  customer_id    uuid references public.customers(id) on delete set null,
  first_seen     timestamptz not null default now(),
  last_seen      timestamptz not null default now(),
  device         text,
  browser        text,
  os             text,
  screen         text,
  language       text,
  country        text,
  city           text,
  first_referrer text,
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  utm_term       text,
  utm_content    text
);

create table if not exists public.sessions (
  id           uuid primary key,
  visitor_id   uuid not null references public.visitors(id) on delete cascade,
  started_at   timestamptz not null default now(),
  ended_at     timestamptz not null default now(),
  landing_page text,
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text
);

create table if not exists public.events (
  id         bigint generated always as identity primary key,
  visitor_id uuid references public.visitors(id) on delete cascade,  -- null = pre-consent anonymous count
  session_id uuid references public.sessions(id) on delete cascade,
  event_type text not null check (event_type in (
    'page_view', 'time_on_page', 'portfolio_click', 'cta_click', 'contact_submit',
    'login_popup_shown', 'login_popup_dismissed', 'login_completed'
  )),
  path       text,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_links (
  id            uuid primary key default gen_random_uuid(),
  category      text not null check (category in ('website', 'ai')),
  title         text not null,
  url           text not null,
  description   text,
  thumbnail_url text,
  display_order integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  category      text not null check (category in ('website', 'ai')),
  client_name   text not null,
  company       text,
  quote         text not null,
  rating        smallint not null default 5 check (rating between 1 and 5),
  photo_url     text,
  featured      boolean not null default false,
  display_order integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 200),
  email      text not null check (char_length(email) between 3 and 320),
  phone      text check (char_length(phone) <= 30),
  message    text not null check (char_length(message) between 1 and 5000),
  visitor_id uuid references public.visitors(id) on delete set null,
  status     text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  notes      text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index if not exists visitors_customer_idx  on public.visitors (customer_id);
create index if not exists visitors_last_seen_idx on public.visitors (last_seen desc);
create index if not exists sessions_visitor_idx   on public.sessions (visitor_id, started_at);
create index if not exists sessions_started_idx   on public.sessions (started_at);
create index if not exists events_created_idx     on public.events (created_at);
create index if not exists events_visitor_idx     on public.events (visitor_id, created_at);
create index if not exists events_session_idx     on public.events (session_id, created_at);
create index if not exists events_type_idx        on public.events (event_type, created_at);
create index if not exists portfolio_public_idx   on public.portfolio_links (category, is_active, display_order);
create index if not exists testimonials_public_idx on public.testimonials (category, is_active, display_order);
create index if not exists leads_created_idx      on public.leads (created_at desc);

-- -----------------------------------------------------------------------------
-- Helper: is the current request made by an admin?
-- Requires a VERIFIED email in neon_auth.user that is listed in public.admins,
-- and an account with NO password. Admins sign in with email OTP only; this
-- stops someone who pre-registered the admin email with a password (before the
-- real admin's first OTP login verified it) from inheriting admin access.
-- SECURITY DEFINER so it can read neon_auth tables and admins regardless of RLS.
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from neon_auth."user" u
    join public.admins a on a.email = u.email::citext
    where u.id::text = auth.user_id()
      and u."emailVerified" is true
      and not exists (
        select 1 from neon_auth.account acc
        where acc."userId" = u.id and acc.password is not null
      )
  );
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.admins          enable row level security;
alter table public.customers       enable row level security;
alter table public.visitors        enable row level security;
alter table public.sessions        enable row level security;
alter table public.events          enable row level security;
alter table public.portfolio_links enable row level security;
alter table public.testimonials    enable row level security;
alter table public.leads           enable row level security;

-- Drop and recreate policies so this script stays re-runnable.
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public'
           and tablename in ('admins','customers','visitors','sessions','events',
                             'portfolio_links','testimonials','leads')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Public writes: visitors may insert tracking rows and leads, but never read them.
create policy visitors_public_insert on public.visitors
  for insert to anonymous, authenticated with check (customer_id is null);
create policy sessions_public_insert on public.sessions
  for insert to anonymous, authenticated with check (true);
create policy events_public_insert on public.events
  for insert to anonymous, authenticated with check (true);
create policy leads_public_insert on public.leads
  for insert to anonymous, authenticated with check (status = 'new' and notes is null);

-- Public reads: only active portfolio links and testimonials.
create policy portfolio_public_read on public.portfolio_links
  for select to anonymous, authenticated using (is_active);
create policy testimonials_public_read on public.testimonials
  for select to anonymous, authenticated using (is_active);

-- Admins: read everything; manage content and leads.
create policy admins_admin_read     on public.admins    for select to authenticated using (public.is_admin());
create policy customers_admin_read  on public.customers for select to authenticated using (public.is_admin());
create policy visitors_admin_read   on public.visitors  for select to authenticated using (public.is_admin());
create policy sessions_admin_read   on public.sessions  for select to authenticated using (public.is_admin());
create policy events_admin_read     on public.events    for select to authenticated using (public.is_admin());
create policy leads_admin_read      on public.leads     for select to authenticated using (public.is_admin());
create policy leads_admin_update    on public.leads     for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy leads_admin_delete    on public.leads     for delete to authenticated using (public.is_admin());

create policy portfolio_admin_all on public.portfolio_links
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy testimonials_admin_all on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Table privileges (RLS above narrows these down to specific rows)
-- -----------------------------------------------------------------------------

grant usage on schema public to anonymous, authenticated;
revoke all on all tables in schema public from anonymous, authenticated;

grant insert on public.visitors, public.sessions, public.events, public.leads to anonymous, authenticated;
grant select on public.portfolio_links, public.testimonials to anonymous, authenticated;

grant select on public.admins, public.customers, public.visitors, public.sessions, public.events, public.leads to authenticated;
grant update (status, notes), delete on public.leads to authenticated;
grant insert, update, delete on public.portfolio_links, public.testimonials to authenticated;

-- -----------------------------------------------------------------------------
-- Tracking RPCs (SECURITY DEFINER: anonymous visitors may upsert their own
-- visitor/session rows and bump timestamps, without being able to read data)
-- -----------------------------------------------------------------------------

-- Create/refresh the visitor row and start (or continue) a session.
create or replace function public.track_session(
  p_visitor_id   uuid,
  p_session_id   uuid,
  p_landing_page text default null,
  p_referrer     text default null,
  p_device       text default null,
  p_browser      text default null,
  p_os           text default null,
  p_screen       text default null,
  p_language     text default null,
  p_country      text default null,
  p_city         text default null,
  p_utm          jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.visitors as v (
    id, device, browser, os, screen, language, country, city, first_referrer,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content
  ) values (
    p_visitor_id, left(p_device, 40), left(p_browser, 60), left(p_os, 60), left(p_screen, 30),
    left(p_language, 20), left(p_country, 80), left(p_city, 120), left(p_referrer, 500),
    left(p_utm->>'utm_source', 200), left(p_utm->>'utm_medium', 200), left(p_utm->>'utm_campaign', 200),
    left(p_utm->>'utm_term', 200), left(p_utm->>'utm_content', 200)
  )
  on conflict (id) do update set
    last_seen = now(),
    device    = coalesce(excluded.device, v.device),
    browser   = coalesce(excluded.browser, v.browser),
    os        = coalesce(excluded.os, v.os),
    screen    = coalesce(excluded.screen, v.screen),
    country   = coalesce(v.country, excluded.country),
    city      = coalesce(v.city, excluded.city);

  insert into public.sessions (id, visitor_id, landing_page, referrer, utm_source, utm_medium, utm_campaign)
  values (p_session_id, p_visitor_id, left(p_landing_page, 500), left(p_referrer, 500),
          left(p_utm->>'utm_source', 200), left(p_utm->>'utm_medium', 200), left(p_utm->>'utm_campaign', 200))
  on conflict (id) do update set ended_at = now();
end;
$$;

-- Keep the session alive / record when it ended.
create or replace function public.touch_session(p_visitor_id uuid, p_session_id uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.sessions set ended_at = now() where id = p_session_id and visitor_id = p_visitor_id;
  update public.visitors set last_seen = now() where id = p_visitor_id;
$$;

-- -----------------------------------------------------------------------------
-- Customer linking RPCs
-- -----------------------------------------------------------------------------

-- Called right after an email OTP sign-in. Finds/creates the customer for the
-- signed-in auth user and links the current visitor (and so all its past
-- sessions and events) to that customer.
create or replace function public.link_customer(p_visitor_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := nullif(auth.user_id(), '')::uuid;
  v_user  jsonb;
  v_email citext;
  v_phone text;
  v_id    uuid;
begin
  if v_uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;

  -- to_jsonb keeps this working whether or not the Phone Number plugin has
  -- added a "phoneNumber" column to neon_auth.user.
  select to_jsonb(u) into v_user from neon_auth."user" u where u.id = v_uid;
  v_email := nullif(v_user->>'email', '');
  v_phone := case when (v_user->>'phoneNumberVerified')::boolean then nullif(v_user->>'phoneNumber', '') end;

  select id into v_id from public.customers where auth_user_id = v_uid;
  if v_id is null and v_email is not null then
    select id into v_id from public.customers where email = v_email;
  end if;
  if v_id is null and v_phone is not null then
    select id into v_id from public.customers where phone = v_phone;
  end if;

  if v_id is null then
    insert into public.customers (email, phone, phone_verified, auth_user_id)
    values (v_email, v_phone, v_phone is not null, v_uid) returning id into v_id;
  else
    update public.customers
       set auth_user_id   = coalesce(auth_user_id, v_uid),
           email          = coalesce(email, v_email),
           phone          = coalesce(phone, case when not exists (
                                select 1 from public.customers c2 where c2.phone = v_phone) then v_phone end),
           phone_verified = phone_verified or (v_phone is not null and phone = v_phone),
           last_login     = now()
     where id = v_id;
  end if;

  if p_visitor_id is not null then
    update public.visitors set customer_id = v_id where id = p_visitor_id;
  end if;
  return v_id;
end;
$$;

-- Fallback used while PHONE_OTP_ENABLED = false: records an UNVERIFIED phone
-- number and links the visitor to it. Customers created this way are flagged
-- phone_verified = false in the dashboard.
create or replace function public.register_phone_customer(p_visitor_id uuid, p_phone text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  v_id    uuid;
begin
  if v_phone !~ '^\+?[0-9]{8,15}$' then
    raise exception 'invalid phone number' using errcode = '22023';
  end if;

  insert into public.customers (phone, phone_verified) values (v_phone, false)
  on conflict (phone) do update set last_login = now()
  returning id into v_id;

  if p_visitor_id is not null then
    update public.visitors set customer_id = v_id where id = p_visitor_id;
  end if;
  return v_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admin analytics RPCs (SECURITY INVOKER: RLS still applies, plus an explicit
-- admin check so non-admins get a clear error instead of empty numbers)
-- -----------------------------------------------------------------------------

create or replace function public.admin_overview(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public, pg_temp
as $$
declare result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  with
  ev as (select * from public.events where created_at >= p_from and created_at < p_to),
  ss as (select * from public.sessions where started_at >= p_from and started_at < p_to),
  views_per_session as (
    select s.id, count(e.id) filter (where e.event_type = 'page_view') as views
    from ss s left join public.events e on e.session_id = s.id
    group by s.id
  )
  select jsonb_build_object(
    'page_views',      (select count(*) from ev where event_type = 'page_view'),
    'unique_visitors', (select count(distinct visitor_id) from ev where visitor_id is not null),
    'customers',       (select count(distinct v.customer_id) from public.visitors v
                          where v.customer_id is not null and v.last_seen >= p_from and v.first_seen < p_to),
    'new_customers',   (select count(*) from public.customers where created_at >= p_from and created_at < p_to),
    'sessions',        (select count(*) from ss),
    'avg_session_seconds', (select coalesce(round(avg(extract(epoch from (ended_at - started_at)))), 0) from ss),
    'bounce_rate',     (select case when count(*) = 0 then 0
                               else round(100.0 * count(*) filter (where views <= 1) / count(*), 1) end
                          from views_per_session),
    'leads',           (select count(*) from public.leads where created_at >= p_from and created_at < p_to),
    'popup_shown',     (select count(*) from ev where event_type = 'login_popup_shown'),
    'popup_completed', (select count(*) from ev where event_type = 'login_completed'),
    'per_day', coalesce((
        select jsonb_agg(jsonb_build_object('day', day, 'visitors', visitors, 'views', views) order by day)
        from (select date_trunc('day', created_at)::date as day,
                     count(distinct visitor_id) as visitors,
                     count(*) as views
              from ev where event_type = 'page_view' group by 1) d), '[]'::jsonb),
    'top_pages', coalesce((
        select jsonb_agg(jsonb_build_object('path', path, 'views', views) order by views desc)
        from (select path, count(*) as views from ev where event_type = 'page_view'
              group by path order by 2 desc limit 10) p), '[]'::jsonb),
    'top_referrers', coalesce((
        select jsonb_agg(jsonb_build_object('source', source, 'sessions', n) order by n desc)
        from (select coalesce(nullif(utm_source, ''),
                              nullif(substring(referrer from '^https?://(?:www\.)?([^/:]+)'), ''),
                              'Direct') as source,
                     count(*) as n
              from ss group by 1 order by 2 desc limit 10) r), '[]'::jsonb),
    'devices', coalesce((
        select jsonb_agg(jsonb_build_object('device', device, 'visitors', n) order by n desc)
        from (select coalesce(v.device, 'unknown') as device, count(distinct v.id) as n
              from public.visitors v join ss on ss.visitor_id = v.id group by 1) d), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

-- One row per visitor with rolled-up stats for the Visitors table.
create or replace function public.admin_visitors(p_from timestamptz, p_to timestamptz, p_search text default null)
returns table (
  visitor_id uuid, customer_id uuid, email text, phone text, phone_verified boolean,
  first_seen timestamptz, last_seen timestamptz, sessions bigint, total_seconds bigint,
  source text, device text, country text, city text
)
language plpgsql
stable
security invoker
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select v.id, v.customer_id, c.email::text, c.phone, c.phone_verified,
         v.first_seen, v.last_seen,
         (select count(*) from public.sessions s where s.visitor_id = v.id),
         (select coalesce(sum(extract(epoch from (s.ended_at - s.started_at)))::bigint, 0)
            from public.sessions s where s.visitor_id = v.id),
         coalesce(nullif(v.utm_source, ''),
                  nullif(substring(v.first_referrer from '^https?://(?:www\.)?([^/:]+)'), ''),
                  'Direct'),
         v.device, v.country, v.city
  from public.visitors v
  left join public.customers c on c.id = v.customer_id
  where v.last_seen >= p_from and v.first_seen < p_to
    and (p_search is null or p_search = ''
         or v.id::text ilike '%' || p_search || '%'
         or v.customer_id::text ilike '%' || p_search || '%'
         or c.email::text ilike '%' || p_search || '%'
         or c.phone ilike '%' || p_search || '%')
  order by v.last_seen desc
  limit 1000;
end;
$$;

revoke all on function public.track_session, public.touch_session, public.link_customer,
  public.register_phone_customer, public.admin_overview, public.admin_visitors, public.is_admin from public;
grant execute on function public.track_session, public.touch_session, public.register_phone_customer
  to anonymous, authenticated;
grant execute on function public.link_customer, public.admin_overview, public.admin_visitors, public.is_admin
  to authenticated;

-- -----------------------------------------------------------------------------
-- Seed data (only inserted when the tables are empty)
-- -----------------------------------------------------------------------------

insert into public.portfolio_links (category, title, url, description, thumbnail_url, display_order)
select * from (values
  ('website', 'Sample: Restaurant Website', 'https://example.com', 'Responsive site with online menu and table booking.', null, 1),
  ('website', 'Sample: Clinic Landing Page', 'https://example.org', 'Fast landing page with appointment form and Google Maps.', null, 2),
  ('website', 'Sample: E-commerce Store', 'https://example.net', 'Product catalogue, cart and UPI checkout integration.', null, 3),
  ('ai', 'Sample: WhatsApp Lead Bot', 'https://example.com', 'Answers enquiries 24/7 and pushes qualified leads to a CRM.', null, 1),
  ('ai', 'Sample: Invoice Automation', 'https://example.org', 'Reads invoices from email, extracts data and updates sheets.', null, 2),
  ('ai', 'Sample: Support Ticket Triage', 'https://example.net', 'Classifies and routes support tickets with an AI workflow.', null, 3)
) as s(category, title, url, description, thumbnail_url, display_order)
where not exists (select 1 from public.portfolio_links);

insert into public.testimonials (category, client_name, company, quote, rating, featured, display_order)
select * from (values
  ('website', 'Priya S.', 'Sample Bakery', 'Our new website doubled online orders within two months.', 5, true, 1),
  ('website', 'Rahul M.', 'Sample Clinic', 'Professional, quick and very easy to work with.', 5, false, 2),
  ('website', 'Anita K.', 'Sample Boutique', 'The site looks great on mobile and loads instantly.', 4, false, 3),
  ('ai', 'Vikram T.', 'Sample Logistics', 'The automation saves our team about 15 hours every week.', 5, true, 1),
  ('ai', 'Neha R.', 'Sample Agency', 'Our lead follow-up is now instant instead of next-day.', 5, true, 2),
  ('ai', 'Arjun P.', 'Sample Traders', 'Invoice processing went from manual to fully hands-off.', 4, false, 3)
) as s(category, client_name, company, quote, rating, featured, display_order)
where not exists (select 1 from public.testimonials);

-- -----------------------------------------------------------------------------
-- Add yourself as an admin (replace with the email you will sign in with):
--   insert into public.admins (email) values ('you@example.com') on conflict do nothing;
-- -----------------------------------------------------------------------------
