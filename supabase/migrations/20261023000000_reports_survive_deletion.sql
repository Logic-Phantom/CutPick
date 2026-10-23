-- Reports must keep working after their target is deleted.
--
-- The table-level CHECK (post_id is not null or reported_user_id is not null) also fired when a
-- reported post or account was deleted: the FKs are ON DELETE SET NULL, so the row lost its target
-- and the CHECK aborted the whole delete. Result: anyone who had been reported could not delete
-- their post or their account (found by supabase/tests/rls_test.sql on 2026-10-23).
--
-- The "must name a target" rule only matters when a report is filed, so it moves into the insert
-- policy. A report whose target was deleted stays as an operator record with both columns null.
alter table public.reports drop constraint if exists reports_check;

drop policy if exists "users file reports" on public.reports;
create policy "users file reports" on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid() and status = 'open' and (post_id is not null or reported_user_id is not null));
