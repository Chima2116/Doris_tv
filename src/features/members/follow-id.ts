/** Namespaced follow-target ids. Kept out of the client store so server components can use it. */
export const followId = {
  filmmaker: (slug: string) => `filmmaker:${slug}`,
  member: (username: string) => `member:${username}`,
};
