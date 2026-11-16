/**
 * DORIS TV domain types (Stage 1, frontend-only).
 * These mirror what a future backend would return, so mock repositories can be
 * swapped for API-backed ones without touching the UI.
 */

export type AccountStatus = "active" | "restricted" | "suspended" | "deleted";
export type MemberRole = "member" | "filmmaker" | "moderator" | "admin";
export type ProfileVisibility = "public" | "private";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

export type RevisionStatus = "pending" | "approved" | "rejected";

/** Privacy controls: a private profile stays discoverable; these hide sections/fields. */
export type ProfileSection = "bio" | "location" | "activity" | "following" | "saved";
export type PrivacySettings = {
  visibility: ProfileVisibility;
  hiddenSections: ProfileSection[];
};

export type Member = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  memberSince: string; // ISO date
  roles: MemberRole[];
  accountStatus: AccountStatus;
  emailVerified: boolean;
  profileVisibility: ProfileVisibility;
  privacy: PrivacySettings;
  filmmakerId?: string;
  /** Set when an administrator suspends the account (explicit decision about public discussions). */
  suspension?: {
    at: string;
    by: string;
    reason?: string;
    discussions: "keep" | "hide";
  };
};

export type JournalCategory =
  | "Interview"
  | "Essay"
  | "Production Notes"
  | "Retrospective"
  | "Video";

export type ArticleStatus = "draft" | "scheduled" | "published";

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "image"; alt: string; caption?: string; seed?: string; src?: string };

export type JournalArticle = {
  id: string;
  slug: string;
  title: string;
  deck?: string;
  coverImage: string;
  coverAlt: string;
  category: JournalCategory;
  author: string;
  authorBio?: string;
  publishedAt: string;
  readingTime: number; // minutes
  featured: boolean;
  status: ArticleStatus;
  /** Video conversations link out; there is no in-site playback. */
  video?: { platform: "YouTube" | "Instagram"; url: string; runtimeMinutes: number };
  filmmakerSlugs?: string[];
  body?: ArticleBlock[];
};

export type FilmCredit = {
  id: string;
  title: string;
  year: number;
  format?: string;
  runtimeMinutes?: number;
  role: string;
  description?: string;
  inProduction?: boolean;
};

export type VerificationStatus = "unverified" | "verified";
export type PublicationStatus = "draft" | "published" | "unpublished";

export type ExternalLink = { label: string; url: string };

export type Filmmaker = {
  id: string;
  slug: string;
  name: string;
  portraitUrl: string;
  portraitAlt: string;
  country: string;
  location?: string;
  primaryDiscipline: string;
  biography: string;
  creativePhilosophy?: string;
  yearsActive?: string;
  activeFrom?: number;
  credits: FilmCredit[];
  links: ExternalLink[];
  verificationStatus: VerificationStatus;
  publicationStatus: PublicationStatus;
  /** Curated for the homepage spotlight. */
  spotlight?: boolean;
  tagline?: string;
  memberId?: string;
};

export type FilmmakerProfileFields = Pick<
  Filmmaker,
  | "name"
  | "country"
  | "location"
  | "primaryDiscipline"
  | "biography"
  | "creativePhilosophy"
  | "yearsActive"
  | "credits"
  | "links"
>;

export type ProfileRevision = {
  id: string;
  filmmakerId: string;
  proposed: FilmmakerProfileFields;
  status: RevisionStatus;
  submittedAt: string;
  decidedAt?: string;
  decisionReason?: string;
};

export type DiscussionStatus = "published" | "hidden" | "deleted";

export type Discussion = {
  id: string;
  authorId: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;
  status: DiscussionStatus;
  hiddenReason?: string;
  replyCount: number;
  reactionCount: number;
};

export type Reply = {
  id: string;
  discussionId: string;
  authorId: string;
  body: string;
  createdAt: string;
  editedAt?: string;
  status: DiscussionStatus;
  hiddenReason?: string;
  reactionCount: number;
};

export type ReportStatus = "open" | "cleared" | "hidden" | "escalated" | "resolved";
export type ReportReason = "spam" | "harassment" | "off_topic" | "misinformation" | "other";

export type ModerationReport = {
  id: string;
  target: { type: "discussion" | "reply"; id: string };
  reporterId: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  escalatedAt?: string;
  resolution?: string;
  notes: { id: string; authorId: string; body: string; createdAt: string }[];
};

export type ApplicationDetails = {
  fullName: string;
  email: string;
  country: string;
  city?: string;
  primaryDiscipline: string;
  yearsActive?: string;
  biography: string;
  creativeBackground?: string;
  creativePhilosophy?: string;
  portfolioUrl?: string;
  links: ExternalLink[];
  credits: FilmCredit[];
};

export type ApplicationEvent = { status: ApplicationStatus; at: string; note?: string };

export type FilmmakerApplication = {
  id: string;
  applicantId: string;
  createdAt: string;
  submittedAt?: string;
  status: ApplicationStatus;
  details: ApplicationDetails;
  /** Status timeline. Earlier applications are retained, never overwritten. */
  history: ApplicationEvent[];
  decisionReason?: string;
  decidedAt?: string;
};

export type Notification = {
  id: string;
  memberId: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type AuditEntry = {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  /** Short machine-friendly action, e.g. "application.approved". */
  action: string;
  detail: string;
};
