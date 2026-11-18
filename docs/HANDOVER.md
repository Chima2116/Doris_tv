# DORIS TV: handover

For the front-end and back-end developers taking over the platform. Read this first, then the
files it points to. Nothing in this document is a secret. Keys and passwords are never written here.

**Status legend:** ✅ done and working · 🟡 built in the browser only, not yet saved to the database · ⬜ not started

---

## Who should read what

| Section | Front end | Back end |
|---|---|---|
| 1. What the platform is | Read | Read |
| 2. How it is built | Read | Read |
| 3. Setup for a new developer | Read | Read |
| 4. Environment variables | Skim | **Read** |
| 5. The database | Skim | **Read** |
| 6. Status of each area | **Read** | **Read** |
| 7. Pending: the things still to build | Read the front-end items | **Read the back-end items** |
| 8. Test accounts | Skim | **Read** |
| 9. Tests | **Read** | Skim |
| 10. Known issues | Read | Read |
| 11. Who to ask | Read | Read |

**Front end** owns the pages, the editors, the forms and the Studio layout.
**Back end** owns the Supabase database, the access rules, email, file storage and the data the pages read.

Items in section 7 marked **(front end)** or **(back end)** say who does them. Items marked **(both)** need
the two to agree on the data shape first.

---

## 1. What the platform is

DORIS TV is a journal, a filmmaker directory and a community for independent Nigerian and African
cinema. Four kinds of people use it:

| Role | What they do |
|---|---|
| Visitor | Reads the Journal, browses filmmakers, reads community threads |
| Member | Has an account, saves and follows, can apply to become a filmmaker |
| Filmmaker | Verified by the team. Has a public profile and writes Journal stories |
| Moderator / Admin | Reviews applications, profile edits and stories; moderates the community |

## 2. How it is built

- **Framework:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS v4, shadcn/ui.
- **Hosting:** Vercel, deploying from the `main` branch of `Chima2116/Doris_tv` on GitHub.
- **Content management:** Sanity Studio at `/studio`. Holds the home page, the About page, the
  Journal collection, and the editor's Journal stories.
- **Accounts and database:** Supabase (Postgres, Auth, row level security). Holds sign-ups, roles,
  applications, filmmaker profiles, profile edits and filmmakers' stories.
- **Email:** Resend, connected through Supabase's custom SMTP. Sends account emails from
  `noreply@doristv.net`.
- **Tests:** Playwright, in `e2e/`.

### Where things live

| Area | Location |
|---|---|
| Pages (routes) | `src/app/` |
| Feature code | `src/features/` (`admin`, `applications`, `auth`, `filmmakers`, `journal`, `members`) |
| Data access | `src/data/repositories/` (Sanity content, Supabase reads) |
| Supabase clients | `src/lib/supabase/` (`client.ts` for the browser, `public.ts` for public reads) |
| Database changes | `supabase/migrations/` (run in order) |
| Sample and demo data | `src/data/mock/` (to be removed or replaced; see section 6) |
| Studio | `sanity/` (schemas and the sidebar structure) |
| Tests | `e2e/` and `playwright.config.ts` |

## 3. Setup for a new developer

1. Clone the repository and run `npm install`.
2. Copy the Supabase URL and publishable key and the Sanity project ID into a local `.env.local`
   (see section 4). Ask the owner for the values. Never commit `.env.local`.
3. Run `npm run dev`. The site runs on port 3000 by default; the team has been using 3100.
4. Run the tests: `PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test`.

## 4. Environment variables

Set these in `.env.local` locally and in Vercel (as Config type, not Secret) for production.

| Variable | Used for | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Sanity content | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project address | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase browser key (safe to expose; row level security protects data) | No |
| `NEXT_PUBLIC_TEST_MEMBER_EMAIL` / `_PASSWORD` | Test member sign-in button (optional) | Test only |
| `NEXT_PUBLIC_TEST_FILMMAKER_EMAIL` / `_PASSWORD` | Test filmmaker sign-in button (optional) | Test only |

**Never** put the Supabase **secret / service-role** key in the repository or in any
`NEXT_PUBLIC_` variable. The site does not need it.

## 5. The database

Run these in the Supabase SQL Editor, **in this order**. Each file is in `supabase/migrations/`.

| # | File | What it adds | Status |
|---|---|---|---|
| 1 | `0001_accounts.sql` | Profiles, roles, filmmaker applications, filmmaker profiles, profile revisions, sign-up trigger | ✅ run |
| 2 | `0002_application_decisions.sql` | Submit, approve and decline applications | ✅ run |
| 3 | `0003_application_review.sql` | "Under review" status | ✅ run |
| 4 | `0004_filmmaker_admin.sql` | Verify and list filmmakers | ✅ run |
| 5 | `0005_journal_stories.sql` | Filmmakers' stories, saved as pending | ✅ run |
| 6 | `0006_publish_stories.sql` | Slugs and public reads of approved stories | ✅ run |

Also: `supabase/seed/test-accounts.sql` gives the test accounts their usernames, roles and dummy
profile details. Run it after the test users are created.

**Access rules:** every table has row level security. Visitors see public profiles and published
filmmaker profiles and approved stories. People see their own applications, stories and roles.
Admins see and decide on everything through database functions that check the admin role.

## 6. Status of each area

### Accounts and sign-in
- ✅ Sign-up with username, sign-in, sign-out, show/hide password.
- ✅ Email verification through Resend, with the Supabase Site URL and redirect addresses set.
- ✅ Member profile loads from Supabase; the owner's roles and unlisted profile load from their session.
- ⬜ Password reset page exists in the design but needs checking against Supabase.
- ⬜ Changing the username is not possible yet (by design for now).

### Member profile, Settings and Edit profile
- ✅ One profile page for everyone: header, filmmaker section, bio, activity.
- ✅ Edit profile has its own page (`/edit-profile`) with a back link.
- 🟡 Saving the name, bio and location in Edit profile saves in the browser only. It needs to write to `profiles`.
- ⬜ Activity (community posts) is still sample data.
- ⬜ Saved articles and Following are stored in the browser only.

### Filmmaker applications
- ✅ Applicants submit an application that is saved in Supabase, with the status view reading it back.
- ✅ Admin sees all applications, with Review, Approve (verifies, unlisted) and Decline (with a reason).
- ✅ Approval creates the filmmaker role and an unlisted profile.
- ⬜ The application's photo is kept in the application details, not in storage (see cover images below).

### Filmmaker profile (listing)
- ✅ Filmmaker profile section on the member's profile, with a status line.
- ✅ Admin Filmmakers page reads Supabase. Verify and List in directory are separate, both confirmed in a dialog.
- 🟡 Filmmakers editing their profile: edits are shown in the Profile edits tab, but they are stored in the browser (`revisions-store`). They need to write to `filmmaker_revisions` and be approved with `approve_revision` / `reject_revision`, which already exist in the database.
- ⬜ Unlisting a profile should also hide it from the public directory once the directory reads Supabase (see section 7).

### Journal (filmmakers' stories)
- ✅ Story editor with headings, quotes, bold, italic, code, underline, strike, lists, images (button, paste and drag) and video links.
- ✅ Expand/minimise, sticky toolbar.
- ✅ Filmmaker sends a story; it is saved as pending in Supabase. My journals shows its status.
- ✅ Admin Journal page: review a story, approve, or decline with a reason.
- ✅ Approved stories appear on the public Journal and open on their own page, with video playing on the page for YouTube, Vimeo and Instagram links that allow it.
- 🟡 Cover images: the picker accepts a file or a pasted picture, but the file is not uploaded yet. Needs Supabase Storage (see section 7).
- ⬜ Body images are stored inside the story itself, which will not scale. They should move to storage too.

### Studio (Sanity)
- ✅ Home page, About page, Journal collection and Journal story (editor's own stories) are managed here.
- ✅ The first section, "Filmmaker stories," links to the admin Journal review. Nothing from filmmakers is copied into the Studio.
- ⬜ The Filmmaker document type still exists, so someone can create a filmmaker by hand. Remove it once the team agrees.
- ⬜ Studio sign-in should be restricted to the admin team.

### Admin area
- ✅ Overview, Applications, Filmmakers, Journal, Members.
- 🟡 Overview counts are sample numbers. Connect them to Supabase.
- 🟡 Members list reads Supabase profiles. Suspending and making moderators is still sample-only; it needs to write to `user_roles` and `profiles.account_status`.
- ⬜ Moderation (reports, hidden content), Analytics and the audit log are sample data.

### Community
- ⬜ Discussions and replies are sample data. This needs its own tables, moderation and the same review rules.

## 7. Pending: the things still to build

### Requested and confirmed in the handover
1. **(both) Admin can unapprove or remove an approved Journal story.** Back end: a status and a function that keeps the record. Front end: the admin button and its confirmation. Removing it takes it off the live Journal. It should keep the record, not delete it.
2. **(both) Filmmakers can edit a story they have sent.** Back end: an edit goes to review as a separate version. Front end: the edit button and the pending notice. A story they edit goes back to review. The admin sees the new version and approves or declines it. The live version stays as it was until approval.
3. **(both) Filmmakers can delete a story they have sent.** Back end: remove only pending or draft stories for the author. Front end: the delete button in My journals. A delete should remove the story from the review queue. A published story can only be removed by an admin, using item 1.
4. **(back end) Cover images for stories** (and filmmaker portraits): create a Supabase Storage bucket for images with the rules that only the owner can upload to their own folder, and that images are public to read. Store the image address with the story and application.
5. **(back end) Filmmaker profile edits saved to Supabase**, using the existing `filmmaker_revisions` table and the approve and reject functions.
6. **(both) Member profile edits saved to Supabase.** Back end: write to the profile table. Front end: the save action on Edit profile. (name, bio, location).
7. **(front end) Unlisted filmmakers hidden from the directory.** The page reads published, verified profiles from Supabase. The public Filmmakers page should read published, verified profiles from Supabase instead of the sample list.
8. **(both) Remove the sample data:** the Members list, Discussions, Revisions, Analytics and Overview counts, the Filmmaker document in the Studio, and the demo identities in `src/data/mock/demo-users.ts` (they only appear in development).

### Improvements that will make the platform easier
- A clear **"Draft saved" and "Sent" timeline** on each story, so filmmakers know where it stands.
- **Email to the filmmaker** when their story or application is approved or declined. Resend is already connected.
- **Preview a story before sending** from the filmmaker side.
- **Search and filters** on the admin Journal and Members lists beyond the status filter.
- **Audit log** on every admin decision (the current log is sample data).
- **Reports for moderation** on the community.
- **Automatic publish from the Studio** of approved stories, if the team wants the Studio to show them too.

## 8. Test accounts

The site has test accounts for each role, so the team can try the platform on the live site.

- Created in Supabase under **Authentication → Users**, with auto-confirm ticked.
- Usernames and roles are set by `supabase/seed/test-accounts.sql`.
- The member and filmmaker sign-in buttons on the sign-in page use the test variables in section 4.
- **Admin and moderator passwords are shared privately**, not on the site.
- Change any test password in Supabase if it is ever shared more widely than intended.

## 9. Tests

- **Public tests** (`e2e/public.spec.ts`): pages load, the header and footer show, sign-in and sign-up
  have their controls, guests are kept out of the admin area and My journals, and the public pages
  show no uncaught errors. These need no accounts.
- **Signed-in tests** (`e2e/signed-in.spec.ts`): the member profile, the member being kept out of
  admin, the filmmaker My journals, and the admin Journal and Members pages. These are skipped until
  the test account variables are set (`TEST_MEMBER_EMAIL`, `TEST_MEMBER_PASSWORD`,
  `TEST_FILMMAKER_EMAIL`, `TEST_FILMMAKER_PASSWORD`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`).

Run them with `PLAYWRIGHT_BASE_URL=<site address> npx playwright test`. Add tests for each new item
in section 7 as it is built.

## 10. Known issues

- Story and application photos are stored inside the database record until storage is set up.
- Filmmaker and member edits to profiles are not yet saved to the database.
- The Studio can still create a Filmmaker document by hand (see section 6).
- Sample data remains on the Community, Analytics and Moderation pages, and it should not be treated as real.
- Lint shows a few warnings that are safe to clean up (unused variables and one library notice).

## 11. Who to ask

- **Product decisions, content, and the Studio:** the DORIS TV team.
- **Supabase and Resend accounts:** the owner of the Doris organisation. Do not share the secret key.
- **Vercel and GitHub:** the owner of the `Chima2116/Doris_tv` repository.
