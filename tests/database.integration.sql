-- Disposable test database ONLY. Apply the migration first. Everything rolls back.
\set ON_ERROR_STOP on
begin;
update public.giveaway_campaigns set enabled = true, opens_at = now() - interval '1 day', closes_at = now() + interval '1 day';

set local role service_role;
do $$
declare v_result text;
begin
  v_result := public.register_giveaway_entry('la-maxim-2026','Șerban','Ana','+40722123456','2026-11-02-v1','2026-11-02-v1',repeat('a',64));
  if v_result <> 'accepted' then raise exception 'Valid registration rejected: %',v_result; end if;
  perform public.register_giveaway_entry('la-maxim-2026','Alt nume','Alt prenume','+40722123456','2026-11-02-v1','2026-11-02-v1',repeat('a',64));
  if (select count(*) from public.giveaway_entries where phone='+40722123456') <> 1 then raise exception 'Duplicate registration saved'; end if;
  if (select last_name from public.giveaway_entries where phone='+40722123456') <> 'Șerban' then raise exception 'Duplicate overwrote original'; end if;
  for i in 3..5 loop
    v_result := public.register_giveaway_entry('la-maxim-2026','Șerban','Ana','+40722123456','2026-11-02-v1','2026-11-02-v1',repeat('a',64));
    if v_result <> 'accepted' then raise exception 'Rate limit triggered early'; end if;
  end loop;
  v_result := public.register_giveaway_entry('la-maxim-2026','Șerban','Ana','+40722123456','2026-11-02-v1','2026-11-02-v1',repeat('a',64));
  if v_result <> 'rate_limited' then raise exception 'Sixth request was not limited'; end if;
  begin
    perform public.register_giveaway_entry('la-maxim-2026','Șerban','Ana','+40722123456','old','2026-11-02-v1',repeat('b',64));
    raise exception 'Old version accepted';
  exception when raise_exception then
    if sqlerrm <> 'Document version mismatch' then raise; end if;
  end;
end $$;
reset role;

set local role anon;
do $$
begin
  begin
    perform count(*) from public.giveaway_entries;
    raise exception 'Anonymous participant data read allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.register_giveaway_entry('la-maxim-2026','Test','Test','+40722123456','2026-11-02-v1','2026-11-02-v1',repeat('c',64));
    raise exception 'Anonymous RPC execution allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.giveaway_entries(campaign_id,last_name,first_name,phone,rules_version,privacy_version)
    values('la-maxim-2026','Test','Test','+40722123457','2026-11-02-v1','2026-11-02-v1');
    raise exception 'Anonymous insert allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

set local role authenticated;
do $$ begin
  begin
    perform count(*) from public.giveaway_entries;
    raise exception 'Authenticated participant data read allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

update public.giveaway_campaigns set closes_at=now()-interval '1 second';
set local role service_role;
do $$ begin
  if public.register_giveaway_entry('la-maxim-2026','Șerban','Ana','+40722123458','2026-11-02-v1','2026-11-02-v1',repeat('d',64)) <> 'closed'
    then raise exception 'Expired campaign accepted'; end if;
end $$;
reset role;
update public.giveaway_campaigns set enabled=false;
set local role service_role;
do $$ begin
  if public.register_giveaway_entry('la-maxim-2026','Șerban','Ana','+40722123458','2026-11-02-v1','2026-11-02-v1',repeat('d',64)) <> 'unavailable'
    then raise exception 'Disabled campaign accepted'; end if;
end $$;
reset role;
rollback;
\echo 'Database integration checks passed; all test data rolled back.'
