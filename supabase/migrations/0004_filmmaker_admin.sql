-- Verifying a filmmaker and listing their profile, as separate admin decisions.
-- Run after 0003_application_review.sql.

-- Verify: gives the filmmaker role. Removing verification also takes the profile out of the directory.
create or replace function public.set_filmmaker_verified(_profile_id uuid, _verified boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  owner uuid;
begin
  if not public.has_role('admin') then
    raise exception 'Only an administrator can verify a filmmaker.';
  end if;
  select owner_id into owner from public.filmmaker_profiles where id = _profile_id;
  if owner is null then
    raise exception 'No filmmaker profile found.';
  end if;

  if _verified then
    insert into public.user_roles (user_id, role, granted_by)
      values (owner, 'filmmaker', (select auth.uid()))
      on conflict do nothing;
  else
    delete from public.user_roles where user_id = owner and role = 'filmmaker';
    update public.filmmaker_profiles set status = 'draft' where id = _profile_id;
  end if;
end;
$$;

-- List: shows the profile in the public directory. Only verified filmmakers can be listed.
create or replace function public.set_filmmaker_listed(_profile_id uuid, _listed boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  owner uuid;
begin
  if not public.has_role('admin') then
    raise exception 'Only an administrator can list a profile.';
  end if;
  select owner_id into owner from public.filmmaker_profiles where id = _profile_id;
  if owner is null then
    raise exception 'No filmmaker profile found.';
  end if;
  if _listed and not exists (
    select 1 from public.user_roles where user_id = owner and role = 'filmmaker'
  ) then
    raise exception 'Verify this filmmaker before listing them in the directory.';
  end if;

  update public.filmmaker_profiles
    set status = case when _listed then 'published'::public.publication_status else 'draft'::public.publication_status end
    where id = _profile_id;
end;
$$;

grant execute on function public.set_filmmaker_verified(uuid, boolean) to authenticated;
grant execute on function public.set_filmmaker_listed(uuid, boolean) to authenticated;
