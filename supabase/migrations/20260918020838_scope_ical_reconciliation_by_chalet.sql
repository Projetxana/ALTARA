drop function if exists public.reconcile_ical_snapshot(
  text,
  text[],
  timestamptz,
  integer
);

create or replace function public.reconcile_ical_snapshot(
  p_provider text,
  p_chalet_id uuid,
  p_present_uids text[],
  p_seen_at timestamptz default now(),
  p_cancel_after integer default 2
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_present_count integer := 0;
  v_suspect_count integer := 0;
  v_cancelled_count integer := 0;
  v_reactivated_count integer := 0;
  v_cancelled_ids uuid[] := array[]::uuid[];
begin
  if p_provider is null or btrim(p_provider) = '' then
    raise exception 'p_provider is required';
  end if;

  if p_chalet_id is null then
    raise exception 'p_chalet_id is required';
  end if;

  if p_cancel_after < 1 then
    raise exception 'p_cancel_after must be >= 1';
  end if;

  p_present_uids := coalesce(p_present_uids, array[]::text[]);

  select count(*)
  into v_reactivated_count
  from public.booking b
  where b.chalet_id = p_chalet_id
    and b.source = p_provider
    and b.external_uid is not null
    and b.external_uid = any(p_present_uids)
    and b.ical_auto_cancelled = true;

  with present_rows as (
    update public.booking b
    set
      ical_missing_syncs = 0,
      ical_last_seen_at = p_seen_at,
      status = case
        when b.ical_auto_cancelled
          then coalesce(b.ical_status_before_cancel, 'confirmed')
        else b.status
      end,
      ical_auto_cancelled = false,
      ical_status_before_cancel = null
    where b.chalet_id = p_chalet_id
      and b.source = p_provider
      and b.external_uid is not null
      and b.external_uid = any(p_present_uids)
    returning b.id
  )
  select count(*) into v_present_count
  from present_rows;

  with missing_rows as (
    update public.booking b
    set ical_missing_syncs = b.ical_missing_syncs + 1
    where b.chalet_id = p_chalet_id
      and b.source = p_provider
      and b.external_uid is not null
      and not (b.external_uid = any(p_present_uids))
      and b.status <> 'cancelled'
      and b.ical_auto_cancelled = false
      and coalesce(b.check_out, b.end_date)
          >= (p_seen_at at time zone 'America/Toronto')::date
    returning b.id, b.ical_missing_syncs
  )
  select count(*)
  into v_suspect_count
  from missing_rows
  where ical_missing_syncs < p_cancel_after;

  with newly_cancelled as (
    update public.booking b
    set
      ical_status_before_cancel = b.status,
      status = 'cancelled',
      ical_auto_cancelled = true
    where b.chalet_id = p_chalet_id
      and b.source = p_provider
      and b.external_uid is not null
      and not (b.external_uid = any(p_present_uids))
      and b.status <> 'cancelled'
      and b.ical_auto_cancelled = false
      and b.ical_missing_syncs >= p_cancel_after
      and coalesce(b.check_out, b.end_date)
          >= (p_seen_at at time zone 'America/Toronto')::date
    returning b.id
  )
  select
    coalesce(array_agg(id), array[]::uuid[]),
    count(*)
  into v_cancelled_ids, v_cancelled_count
  from newly_cancelled;

  if cardinality(v_cancelled_ids) > 0 then
    delete from public.cleaning_tasks ct
    where ct.booking_id = any(v_cancelled_ids)
      and ct.auto_generated = true;
  end if;

  return jsonb_build_object(
    'provider', p_provider,
    'chalet_id', p_chalet_id,
    'present_count', v_present_count,
    'suspect_count', v_suspect_count,
    'cancelled_count', v_cancelled_count,
    'reactivated_count', v_reactivated_count,
    'cancel_after', p_cancel_after,
    'seen_at', p_seen_at
  );
end;
$$;

revoke all on function public.reconcile_ical_snapshot(
  text, uuid, text[], timestamptz, integer
) from public, anon, authenticated;

grant execute on function public.reconcile_ical_snapshot(
  text, uuid, text[], timestamptz, integer
) to service_role;
