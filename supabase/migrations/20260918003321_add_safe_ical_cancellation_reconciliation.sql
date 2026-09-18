alter table public.booking
  add column if not exists ical_missing_syncs integer not null default 0,
  add column if not exists ical_last_seen_at timestamptz,
  add column if not exists ical_auto_cancelled boolean not null default false,
  add column if not exists ical_status_before_cancel text;

alter table public.booking
  drop constraint if exists booking_ical_missing_syncs_nonnegative;

alter table public.booking
  add constraint booking_ical_missing_syncs_nonnegative
  check (ical_missing_syncs >= 0);

create index if not exists booking_ical_reconcile_idx
  on public.booking (source, status, external_uid)
  where external_uid is not null;
