-- Run once in Supabase SQL Editor, or use `supabase db push`.
begin;

create table public.giveaway_campaigns (
  id text primary key,
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  rules_version text not null,
  privacy_version text not null,
  enabled boolean not null default false,
  constraint valid_campaign_window check (opens_at < closes_at)
);

create table public.giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references public.giveaway_campaigns(id),
  last_name text not null check (char_length(last_name) between 2 and 80),
  first_name text not null check (char_length(first_name) between 2 and 80),
  phone text not null check (phone ~ '^\+[1-9][0-9]{6,14}$'),
  created_at timestamptz not null default clock_timestamp(),
  rules_version text not null,
  privacy_version text not null,
  constraint one_entry_per_phone unique (campaign_id, phone)
);

create table public.giveaway_rate_limits (
  campaign_id text not null references public.giveaway_campaigns(id),
  ip_hash text not null check (ip_hash ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  requests integer not null check (requests > 0),
  primary key (campaign_id, ip_hash, window_start)
);
create index giveaway_rate_limits_expiry on public.giveaway_rate_limits(window_start);

alter table public.giveaway_campaigns enable row level security;
alter table public.giveaway_entries enable row level security;
alter table public.giveaway_rate_limits enable row level security;
revoke all on public.giveaway_campaigns, public.giveaway_entries, public.giveaway_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.giveaway_campaigns, public.giveaway_entries, public.giveaway_rate_limits to service_role;
-- Intentionally no policies for anon/authenticated. Only the trusted server writes.

insert into public.giveaway_campaigns (id, opens_at, closes_at, rules_version, privacy_version)
values ('la-maxim-2026', '2026-11-02T00:00:00+02:00', '2026-12-03T00:00:00+02:00', '2026-11-02-v1', '2026-11-02-v1');

create function public.register_giveaway_entry(
  p_campaign_id text, p_last_name text, p_first_name text, p_phone text,
  p_rules_version text, p_privacy_version text, p_ip_hash text
) returns text
language plpgsql security invoker set search_path = ''
as $$
declare
  v_campaign public.giveaway_campaigns%rowtype;
  v_window timestamptz;
  v_requests integer;
begin
  select * into v_campaign from public.giveaway_campaigns where id = p_campaign_id;
  if not found or not v_campaign.enabled then return 'unavailable'; end if;
  if clock_timestamp() < v_campaign.opens_at or clock_timestamp() >= v_campaign.closes_at then
    return 'closed';
  end if;
  if p_rules_version is distinct from v_campaign.rules_version or p_privacy_version is distinct from v_campaign.privacy_version then
    raise exception 'Document version mismatch';
  end if;

  v_window := to_timestamp(floor(extract(epoch from clock_timestamp()) / 900) * 900);
  -- Indexed cleanup also works without pg_cron. See README for idle-time cleanup.
  delete from public.giveaway_rate_limits where window_start < v_window;
  insert into public.giveaway_rate_limits (campaign_id, ip_hash, window_start, requests)
  values (p_campaign_id, p_ip_hash, v_window, 1)
  on conflict (campaign_id, ip_hash, window_start)
  do update set requests = least(public.giveaway_rate_limits.requests + 1, 6)
  returning requests into v_requests;
  if v_requests > 5 then return 'rate_limited'; end if;

  -- Recheck after the rate-limit row lock in case the deadline passed while waiting.
  if clock_timestamp() >= v_campaign.closes_at then return 'closed'; end if;
  insert into public.giveaway_entries (campaign_id, last_name, first_name, phone, rules_version, privacy_version)
  values (p_campaign_id, trim(p_last_name), trim(p_first_name), p_phone, p_rules_version, p_privacy_version)
  on conflict (campaign_id, phone) do nothing;
  return 'accepted';
end;
$$;
revoke all on function public.register_giveaway_entry(text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.register_giveaway_entry(text,text,text,text,text,text,text) to service_role;

commit;
