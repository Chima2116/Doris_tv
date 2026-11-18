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
