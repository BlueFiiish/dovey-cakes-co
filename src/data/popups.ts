// Dovey Cakes Co. - porch pop-ups.
// She sells cookies and cake pops from a cart on her porch most weeks (Rosenberg). The day and
// time vary (Oct 2026 saw a Thursday, a Friday and a Sunday), so the site never guesses a date:
// set `next` when one is known, otherwise the block points people to TikTok for the next date.

export interface Popup {
  dateLabel: string;   // e.g. "Thursday, Oct 23"
  timeLabel: string;   // e.g. "3-8 pm"
  where: string;       // e.g. "Porch pop-up, Rosenberg (exact spot posted on TikTok that morning)"
  menuNote?: string;   // e.g. "Halloween cookie menu + cake pops"
}

export const popups = {
  // Fill this in to show a dated "Next pop-up" card. Leave null for the generic card.
  next: null as Popup | null,

  cadence: "Most weeks, on her porch in Rosenberg",
  typicalHours: "Afternoon into evening (recent pop-ups ran 3 to 8 pm)",
  whatToExpect: [
    "Fresh cookies from the current menu, individually wrapped",
    "Cake pops, $3 each or 4 for $10",
    "First come, first served; pay with Zelle, Cash App or cash",
  ],
  howToFindOut: "The date, time and menu of the week are posted on TikTok a few days ahead.",
} as const;
