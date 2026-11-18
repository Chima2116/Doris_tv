export const DISCIPLINES = ["Director", "Producer", "Cinematographer", "Editor", "Writer", "Composer", "Multi-hyphenate"] as const;
export const CREDIT_FORMATS = ["Feature", "Short", "Documentary", "Series", "Music video", "Other"] as const;
export const COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Cameroon", "Côte d'Ivoire", "DR Congo", "Egypt",
  "Ethiopia", "Gabon", "Ghana", "Kenya", "Madagascar", "Mali", "Morocco", "Mozambique", "Namibia", "Nigeria",
  "Rwanda", "Senegal", "Sierra Leone", "Somalia", "South Africa", "Sudan", "Tanzania", "Togo", "Tunisia",
  "Uganda", "Zambia", "Zimbabwe", "Other (Africa)", "Diaspora",
] as const;

/** Common link platforms. Applicants can add their own from the list. */
export const LINK_PLATFORMS = ["Instagram", "LinkedIn", "IMDb", "TikTok", "YouTube", "Vimeo", "X (Twitter)", "Facebook", "Website"] as const;

/** Common roles on a film. Applicants can add their own from the list. */
export const CREDIT_ROLES = [
  "Director",
  "Producer",
  "Writer",
  "Editor",
  "Cinematographer",
  "Composer",
  "Sound designer",
  "Production designer",
  "Actor",
  "Co-director",
  "Researcher",
] as const;
