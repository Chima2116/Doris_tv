/** The types of Journal story a filmmaker can write. `value` matches the collection key. */
export const JOURNAL_TYPES = [
  { value: "Interview", label: "Interview", hint: "A conversation about how the work gets made." },
  { value: "Essay", label: "Essay", hint: "A longer argument about form, language or the work." },
  { value: "Production Notes", label: "Production notes", hint: "Locations, budgets and finishing a film." },
  { value: "Retrospective", label: "Retrospective", hint: "Looking back at a film, a movement or a place." },
] as const;
