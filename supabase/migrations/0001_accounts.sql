-- DORIS TV: accounts, roles and filmmaker applications.
-- Run in the Supabase SQL editor (or via `supabase db push`). Safe to re-run on an empty project.

-- ── Enums ───────────────────────────────────────────────────────────────
create type public.app_role as enum ('member', 'filmmaker', 'moderator', 'admin');
create type public.application_status as enum ('draft', 'submitted', 'approved', 'rejected');
create type public.publication_status as enum ('draft', 'pending', 'published', 'unpublished');

-- ── Members (one row per sign-up, created automatically) ────────────────
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name  text not null check (char_length(display_name) between 2 and 60),
  bio           text check (char_length(bio) <= 280),
  location      text check (char_length(location) <= 60),
  profile_visibility text not null default 'public' check (profile_visibility in ('public', 'private')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Roles are separate rows, so a member can also be a filmmaker or a moderator.
create table public.user_roles (
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       public.app_role not null,
  granted_by uuid references auth.users (id),
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ── Filmmaker applications and the public filmmaker profile ─────────────
create table public.filmmaker_applications (
  id           uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references auth.users (id) on delete cascade,
  status       public.application_status not null default 'draft',
  details      jsonb not null default '{}'::jsonb,   -- the wizard's answers, incl. portrait URL
  decision_reason text,
  submitted_at timestamptz,
  decided_at   timestamptz,
  decided_by   uuid references auth.users (id),
  created_at   timestamptz not null default now()
);

create table public.filmmaker_profiles (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null unique references auth.users (id) on delete cascade,
  slug           text not null unique,
  name           text not null,
  portrait_url   text,                                  -- the one profile photo
  country        text not null,
  location       text,
  primary_discipline text not null,
  years_active   text,
  biography      text not null,
  creative_philosophy text,
  credits        jsonb not null default '[]'::jsonb,
  links          jsonb not null default '[]'::jsonb,
  status         public.publication_status not null default 'pending',
  approved_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Proposed edits to a live filmmaker profile. The live row is untouched until an admin approves.
create table public.filmmaker_revisions (
  id            uuid primary key default gen_random_uuid(),
  filmmaker_id  uuid not null references public.filmmaker_profiles (id) on delete cascade,
  proposed      jsonb not null,                        -- the full proposed profile fields
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decision_reason text,
  submitted_at  timestamptz not null default now(),
  decided_at    timestamptz,
  decided_by    uuid references auth.users (id)
);

-- ── Helpers ─────────────────────────────────────────────────────────────
create or replace function public.has_role(_role public.app_role)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = _role
  );
$$;

-- New sign-up: create the member profile and the member role.
-- The username is taken from the sign-up metadata; the app must send one.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(coalesce(new.raw_user_meta_data ->> 'username', 'member_' || substr(new.id::text, 1, 8))),
    coalesce(new.raw_user_meta_data ->> 'display_name', 'New member')
  );
  insert into public.user_roles (user_id, role) values (new.id, 'member');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger filmmaker_profiles_touch before update on public.filmmaker_profiles
  for each row execute function public.touch_updated_at();

-- ── Row level security ──────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.filmmaker_applications enable row level security;
alter table public.filmmaker_profiles enable row level security;

-- Members: anyone can read public profiles; people update only their own.
create policy "profiles: public read" on public.profiles
  for select using (profile_visibility = 'public' or id = (select auth.uid()) or public.has_role('admin'));
create policy "profiles: update own" on public.profiles
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Roles: people see their own roles; only admins grant or remove roles.
create policy "roles: read own or admin" on public.user_roles
  for select using (user_id = (select auth.uid()) or public.has_role('admin'));
create policy "roles: admin manages" on public.user_roles
  for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- Applications: applicants see and edit their own; admins see all and decide.
create policy "applications: own" on public.filmmaker_applications
  for select using (applicant_id = (select auth.uid()) or public.has_role('admin'));
create policy "applications: applicant writes" on public.filmmaker_applications
  for insert with check (applicant_id = (select auth.uid()));
create policy "applications: applicant edits drafts" on public.filmmaker_applications
  for update using (applicant_id = (select auth.uid()) and status = 'draft')
  with check (applicant_id = (select auth.uid()));
create policy "applications: admin decides" on public.filmmaker_applications
  for update using (public.has_role('admin')) with check (public.has_role('admin'));

-- Filmmaker profiles: published ones are public; owners and admins see their own.
-- Owners never change the live row directly; they propose a revision instead.
create policy "filmmaker profiles: public read" on public.filmmaker_profiles
  for select using (status = 'published' or owner_id = (select auth.uid()) or public.has_role('admin'));
create policy "filmmaker profiles: owner creates" on public.filmmaker_profiles
  for insert with check (owner_id = (select auth.uid()) and public.has_role('filmmaker') and status = 'pending');
create policy "filmmaker profiles: admin publishes" on public.filmmaker_profiles
  for update using (public.has_role('admin')) with check (public.has_role('admin'));

-- Revisions: owners propose and see their own; admins see all and decide.
alter table public.filmmaker_revisions enable row level security;
create policy "revisions: owner reads own" on public.filmmaker_revisions
  for select using (
    exists (select 1 from public.filmmaker_profiles f where f.id = filmmaker_id and f.owner_id = (select auth.uid()))
    or public.has_role('admin')
  );
create policy "revisions: owner proposes" on public.filmmaker_revisions
  for insert with check (
    status = 'pending'
    and exists (select 1 from public.filmmaker_profiles f where f.id = filmmaker_id and f.owner_id = (select auth.uid()))
  );
create policy "revisions: admin decides" on public.filmmaker_revisions
  for update using (public.has_role('admin')) with check (public.has_role('admin'));

-- Approving copies the proposal onto the live profile in one step. Only admins can call it.
create or replace function public.approve_revision(_revision_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  rev public.filmmaker_revisions%rowtype;
begin
  if not public.has_role('admin') then
    raise exception 'Only an administrator can approve a revision.';
  end if;
  select * into rev from public.filmmaker_revisions where id = _revision_id and status = 'pending';
  if not found then
    raise exception 'That revision is not pending.';
  end if;

  update public.filmmaker_profiles set
    name = rev.proposed ->> 'name',
    portrait_url = rev.proposed ->> 'portrait_url',
    country = rev.proposed ->> 'country',
    location = rev.proposed ->> 'location',
    primary_discipline = rev.proposed ->> 'primary_discipline',
    years_active = rev.proposed ->> 'years_active',
    biography = rev.proposed ->> 'biography',
    creative_philosophy = rev.proposed ->> 'creative_philosophy',
    credits = coalesce(rev.proposed -> 'credits', '[]'::jsonb),
    links = coalesce(rev.proposed -> 'links', '[]'::jsonb),
    status = 'published',
    approved_at = now()
  where id = rev.filmmaker_id;

  update public.filmmaker_revisions
    set status = 'approved', decided_at = now(), decided_by = (select auth.uid())
    where id = _revision_id;
end;
$$;

-- Rejecting leaves the live profile exactly as it is.
create or replace function public.reject_revision(_revision_id uuid, _reason text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.has_role('admin') then
    raise exception 'Only an administrator can reject a revision.';
  end if;
  update public.filmmaker_revisions
    set status = 'rejected', decision_reason = _reason, decided_at = now(), decided_by = (select auth.uid())
    where id = _revision_id and status = 'pending';
end;
$$;
