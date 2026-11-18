-- Filmmakers' Journal stories, waiting for admin review.
-- Run after 0004_filmmaker_admin.sql.

create table public.journal_stories (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references auth.users (id) on delete cascade,
  title         text not null check (char_length(title) between 5 and 120),
  type          text not null,
  excerpt       text check (char_length(excerpt) <= 280),
  body          jsonb not null,                          -- the Tiptap document
  video_url     text,
  cover_credit  text,
  status        text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  review_note   text,
  submitted_at  timestamptz not null default now(),
  decided_at    timestamptz,
  decided_by    uuid references auth.users (id)
);

alter table public.journal_stories enable row level security;

-- Authors see their own stories and can only send new ones, which start as pending.
create policy "stories: author reads own" on public.journal_stories
  for select using (author_id = (select auth.uid()) or public.has_role('admin'));
create policy "stories: verified filmmaker sends" on public.journal_stories
  for insert with check (
    author_id = (select auth.uid())
    and status = 'pending'
    and public.has_role('filmmaker')
  );

-- Admins decide.
create policy "stories: admin decides" on public.journal_stories
  for update using (public.has_role('admin')) with check (public.has_role('admin'));
