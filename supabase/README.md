# Supabase: accounts and roles

Migrations live in `migrations/` and run in order. Apply them in the Supabase SQL editor
(paste the file, Run), or with the Supabase CLI once the project is linked.

Not applied yet. Nothing in the app reads from Supabase yet; sign-in is still the demo switcher.

## Next steps
1. Create the project in the Doris organization (see the transfer notes in chat).
2. Apply `0001_accounts.sql`.
3. Add the project URL and publishable (anon) key to `.env.local` and Vercel as
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never put the service-role key in
   the repo or in `NEXT_PUBLIC_` variables.
4. Wire sign-up and sign-in to Supabase Auth, replacing the demo switcher.

## How profile edits work
- A filmmaker’s edits are saved as a row in `filmmaker_revisions` with status `pending`.
- The live profile in `filmmaker_profiles` is not changed. It stays visible as it was.
- An admin calls `approve_revision(id)`, which copies the proposal onto the live profile, or
  `reject_revision(id, reason)`, which leaves the live profile as it is and records the reason.
