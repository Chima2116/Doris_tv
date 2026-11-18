-- Test accounts. Run AFTER creating these four users in
-- Supabase: Authentication -> Users -> Add user -> Create new user (tick "Auto Confirm User").
-- Use the passwords you set there; they go into Vercel as the NEXT_PUBLIC_TEST_* variables.

-- Friendly usernames for the test accounts (the profile row is created automatically at sign-up).
update public.profiles set username = 'test_member', display_name = 'Test Member'
  where id = (select id from auth.users where email = 'test.member@doristv.net');
update public.profiles set username = 'test_filmmaker', display_name = 'Test Filmmaker'
  where id = (select id from auth.users where email = 'test.filmmaker@doristv.net');
update public.profiles set username = 'test_moderator', display_name = 'Test Moderator'
  where id = (select id from auth.users where email = 'test.moderator@doristv.net');
update public.profiles set username = 'test_admin', display_name = 'Test Admin'
  where id = (select id from auth.users where email = 'test.admin@doristv.net');

-- Roles. Members already have the member role from the sign-up trigger.
insert into public.user_roles (user_id, role)
  select id, 'filmmaker' from auth.users where email = 'test.filmmaker@doristv.net'
  on conflict do nothing;
insert into public.user_roles (user_id, role)
  select id, 'moderator' from auth.users where email = 'test.moderator@doristv.net'
  on conflict do nothing;
insert into public.user_roles (user_id, role)
  select id, 'admin' from auth.users where email = 'test.admin@doristv.net'
  on conflict do nothing;

-- Dummy details so each test account looks like a real, lived-in profile.
update public.profiles set bio = 'Watching and writing about African cinema. Test account.', location = 'Lagos, Nigeria'
  where username = 'test_member';
update public.profiles set bio = 'Documentary director working between Lagos and Accra. Test account.', location = 'Lagos, Nigeria'
  where username = 'test_filmmaker';
update public.profiles set bio = 'Reviews reports and keeps the community welcoming. Test account.', location = 'Abuja, Nigeria'
  where username = 'test_moderator';

-- A published filmmaker profile for the filmmaker test account.
insert into public.filmmaker_profiles (owner_id, slug, name, country, location, primary_discipline, years_active, biography, creative_philosophy, credits, links, status, approved_at)
  select id, 'test-filmmaker', 'Test Filmmaker', 'Nigeria', 'Lagos', 'Director', '2019 to present',
    'Test filmmaker profile. Documentary director working on stories about work, water and the people who keep the city running. Replace this text whenever you like.',
    'Stay close to the people in the frame.',
    '[{"id":"c1","title":"Ferry Hands","year":2023,"format":"Documentary","role":"Director"},{"id":"c2","title":"Night Shift at the Port","year":2025,"format":"Short documentary","role":"Director, editor"}]'::jsonb,
    '[]'::jsonb, 'published', now()
  from auth.users where email = 'test.filmmaker@doristv.net'
  on conflict (owner_id) do nothing;
