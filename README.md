# DORIS TV — Stage 1 frontend

> **Where Independent African Film Lives.**
> A premium editorial and community platform for independent African cinema. This repository is the
> **frontend-only** Stage 1 prototype. There is no backend: everything that looks like data
> persistence, authentication or permissions is a clearly-marked simulation.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also type-checks)
npm run lint
```

Requires Node 20+ (developed on Node 24). Next.js 16 with **Cache Components** enabled.

## The four pillars

| Pillar | Routes |
|---|---|
| **Editorial** — the Journal | `/journal`, `/journal/[slug]` |
| **Filmmakers** — a professional directory | `/filmmakers`, `/filmmakers/[slug]` |
| **Community** — public reading, member participation | `/community`, `/community/[thread-id]` |
| **Membership** — waitlist, accounts, applications | `/waitlist`, `/sign-in`, `/sign-up`, `/profile/[username]`, `/settings`, `/saved`, `/following`, `/filmmaker-application`, `/filmmaker-dashboard/profile` |

Plus `/about` and the admin area (`/admin/*`: overview, journal, applications, filmmakers,
moderation, members, waitlist, analytics).

### Stage 1 scope (non-negotiable)

No Archive, no streaming or playback, no film catalogue, no reviews system. Filmography entries are
professional credits. Global search covers **Journal and Filmmakers only** (never Community).
See the product decisions in the brief; they are encoded in code comments where they apply.

## Try the roles: the demo account switcher

In development there is a **“Demo” button (bottom right)** that switches the simulated user. It is
hidden in production builds and is **not authentication or security**.

| Identity | What it demonstrates |
|---|---|
| Guest | Public reading; every gated action shows a prompt and keeps the intended action |
| Unverified member | Signed in but gated (“Verify your email”) |
| Waitlisted member | Verified + waitlist-linked: can take part in Community, can apply as a filmmaker |
| Approved member | Standard member |
| Filmmaker applicant | Application under review |
| Rejected applicant | Rejection reason, can start a new application, history retained |
| Verified filmmaker | Manages their profile; **every change is a pending revision** |
| Moderator | Moderation only: review, note, hide pending review, escalate (no delete/restore) |
| Admin | All admin sections, restore/delete, suspend/reactivate, approve/reject |
| Suspended moderator | Account status beats role: moderation powers are off |

Things worth trying: save an article as a guest (you’re prompted, sign in, and it completes);
apply as a filmmaker and step through states with the dev-only panel on the status page; as admin,
approve Esi Mensah-Boateng’s pending revision and watch her public profile change; suspend a member
and make the explicit keep/hide decision about their discussions.

## Architecture

```
src/
├── app/                 Next.js App Router. Route groups: (public) (auth) (member), plus admin/
├── components/          ui/ (shadcn, restyled) · layout/ · navigation/ · shared/
├── features/            auth · community · journal · filmmakers · members · applications · admin · waitlist
├── data/
│   ├── types/           Domain types (Member, JournalArticle, Filmmaker, Discussion, …)
│   ├── mock/            Typed seed data (articles, filmmakers, discussions, replies, applications, …)
│   └── repositories/    The ONLY way components read seed data (async functions)
└── lib/                 permissions · persisted-store · format · utils
```

**Design system:** tokens live in `src/app/globals.css` (black `#0D0D0D`, white, gold `#E8A020`, plus
reading text, surface, elevated, border and semantic colours). Radius is 0 (avatars are round).
Display type is Poppins Black; body is Inter. The filmstrip is the recurring film-inspired motif.
Brand notes: black on gold has 8.8:1 contrast; never put white text on gold.

**Rendering model:** public pages render seed data on the server. Everything mutable in the
prototype (session, follows, saves, community posts, applications, revisions, admin decisions,
waitlist) lives in small **client stores persisted to `localStorage`**
(`lib/persisted-store.ts`). Pages that depend on that state resolve it on the client; an overlay
(`features/filmmakers/filmmaker-overlay.ts`) merges approved revisions and approved applications
into the public filmmaker pages. Pages gated on the client export `instant = false`
(Next 16 Cache Components validation).

**Permissions:** all rules live in `src/lib/permissions.ts` (account status beats role; community
eligibility = authenticated + active + verified email + waitlist-linked + member role). The UI
checks are for demonstration only. **A backend must enforce every permission itself.**

## What is simulated vs real

| Simulated in the browser | Real in a future backend |
|---|---|
| Sign-in/up/reset, email verification | Authentication, sessions, verification email |
| Waitlist storage and CSV export | Persistence and delivery |
| Discussions, replies, reactions, reports | Database, moderation tooling |
| Application and revision decisions | Admin-only operations with authorisation |
| Journal CMS (does not change the public Journal) | Headless CMS |
| Analytics trends and read counts | Real analytics |
| Notifications (“reporter notified”) | Email/in-app notifications |

## Connecting a backend later

1. Replace `src/data/repositories/*` with API-backed implementations (same function signatures).
2. Replace each client store in `src/features/**/**-store.ts` with data fetching and mutations; the
   action modules (`features/admin/admin-actions.ts`, `applicationsStore.setStatus`,
   `revisionsStore.decide`, `community.*`) map one-to-one onto API calls.
3. Replace `features/auth/session-provider.tsx` with real auth; keep `lib/permissions.ts` as the
   shared UI hint layer and enforce the same rules server-side.
4. Remove `DemoAccountSwitcher`, the `/design-system` route and the dev-only panels (they already
   render nothing in production).

## Known limitations

- **Placeholder imagery.** No photography was supplied, so `ArtImage` renders art-directed
  duotone placeholders. Pass `src` and the UI is unchanged.
- **Wordmark is a text placeholder** (the Brand Bible’s artwork is marked placeholder).
- Newly approved filmmakers appear in the directory and on their own page, but not in the header
  search index or the homepage spotlight (those use the original seed data).
- Unknown community thread ids and filmmaker slugs show a “not found” panel (HTTP 200) because
  prototype-created content exists only in browser storage.
- The Journal CMS and analytics are demonstrations, as labelled in the UI.
- Social links point to platform homepages until real handles are supplied.

## Accessibility and QA notes

Targeting WCAG 2.1 AA: semantic landmarks, one `h1` per page, labelled controls, visible gold focus
rings, `prefers-reduced-motion` support, accessible dialogs/drawers (Radix), tables with captions
and scroll regions, charts with a “View as table” alternative. Text contrast ratios are in the
design tokens; form-control borders use a dedicated lighter token to meet 3:1.
Automated route/link, heading, label and landmark audits and a per-role capability check were run
during Phase 6; a full axe-core pass is recommended before launch.
