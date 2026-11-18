-- Approved filmmaker stories appear on the Journal. Run after 0005_journal_stories.sql.

alter table public.journal_stories add column if not exists slug text unique;

-- Anyone can read approved stories; drafts, pending and declined stories stay private.
create policy "stories: public reads approved" on public.journal_stories
  for select using (status = 'approved');
