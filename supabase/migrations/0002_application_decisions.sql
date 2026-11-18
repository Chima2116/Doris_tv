
-- An applicant sends their application. One open application at a time.
create or replace function public.submit_application(_details jsonb)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  new_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in to apply.';
  end if;
  if exists (
    select 1 from public.filmmaker_applications
    where applicant_id = (select auth.uid()) and status = 'submitted'
  ) then
    raise exception 'You already have an application under review.';
  end if;

  insert into public.filmmaker_applications (applicant_id, status, details, submitted_at)
  values ((select auth.uid()), 'submitted', _details, now())
  returning id into new_id;
  return new_id;
end;
$$;

-- Turns a name into a URL slug, with a short suffix so two people with the same name don't clash.
create or replace function public.make_filmmaker_slug(_name text)
returns text
language sql immutable set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(_name), '[^a-z0-9]+', '-', 'g'))
    || '-' || substr(md5(random()::text), 1, 4);
$$;

-- Admin approves: the applicant becomes a verified filmmaker and gets a profile that is NOT listed.
-- Listing is a separate admin decision (filmmaker_profiles.status = 'published').
create or replace function public.approve_application(_application_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  app public.filmmaker_applications%rowtype;
  d jsonb;
begin
  if not public.has_role('admin') then
    raise exception 'Only an administrator can approve an application.';
  end if;

  select * into app from public.filmmaker_applications
    where id = _application_id and status = 'submitted';
  if not found then
    raise exception 'That application is not waiting for a decision.';
  end if;
  d := app.details;

  update public.filmmaker_applications
    set status = 'approved', decided_at = now(), decided_by = (select auth.uid())
    where id = app.id;

  insert into public.user_roles (user_id, role, granted_by)
    values (app.applicant_id, 'filmmaker', (select auth.uid()))
    on conflict do nothing;

  insert into public.filmmaker_profiles (
    owner_id, slug, name, portrait_url, country, location, primary_discipline,
    years_active, biography, creative_philosophy, credits, links, status
  ) values (
    app.applicant_id,
    public.make_filmmaker_slug(coalesce(d ->> 'fullName', 'filmmaker')),
    coalesce(d ->> 'fullName', 'Filmmaker'),
    nullif(d ->> 'portraitUrl', ''),
    coalesce(d ->> 'country', ''),
    nullif(d ->> 'city', ''),
    coalesce(d ->> 'primaryDiscipline', ''),
    nullif(d ->> 'yearsActive', ''),
    coalesce(d ->> 'biography', ''),
    nullif(d ->> 'creativePhilosophy', ''),
    coalesce(d -> 'credits', '[]'::jsonb),
    coalesce(d -> 'links', '[]'::jsonb),
    'draft'
  )
  on conflict (owner_id) do nothing;
end;
$$;

-- Admin declines: the reason is saved and shown to the applicant. No profile is created.
create or replace function public.decline_application(_application_id uuid, _reason text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.has_role('admin') then
    raise exception 'Only an administrator can decline an application.';
  end if;
  if _reason is null or char_length(trim(_reason)) < 10 then
    raise exception 'Give the applicant a reason of at least 10 characters.';
  end if;

  update public.filmmaker_applications
    set status = 'rejected', decision_reason = _reason, decided_at = now(), decided_by = (select auth.uid())
    where id = _application_id and status = 'submitted';
end;
$$;

grant execute on function public.submit_application(jsonb) to authenticated;
grant execute on function public.approve_application(uuid) to authenticated;
grant execute on function public.decline_application(uuid, text) to authenticated;
