// Dovey Cakes Co. - core business config (single source of truth).
// Brand-only site (no owner name) per Josia 2026-10-22. Items marked TODO are
// unconfirmed facts to check with her before the site is "official".

export const business = {
  name: "Dovey Cakes Co.",
  tagline: "Custom cakes, cookies & cake pops in Rosenberg, TX",
  shortBlurb:
    "Hand-piped custom cakes, cookies and cake pops from a small home kitchen in Rosenberg, TX. " +
    "Made to order for birthdays, baby showers and every reason to celebrate.",

  contact: {
    email: "J.v.marie874@gmail.com",   // TODO confirm this is still the order inbox (from June 2026)
    phone: null,                        // brand-only, no public number
    tiktok: {
      handle: "@doveycakesco",
      url: "https://www.tiktok.com/@doveycakesco",
    },
  },

  location: {
    city: "Rosenberg, TX",
    serviceArea: "Rosenberg, Richmond & Fort Bend County",
    homeBased: true,                    // TODO confirm -> cottage-food disclosure below
  },

  ordering: {
    method: "inquiry-form",             // made-to-order; NOT a checkout
    leadTimeDays: 7,                    // from her policy card (June 2026)
    rushFeeUsd: 10,                     // under a week = rush order
    deposit: "50% due at booking; balance any time before pickup",
    payments: ["Zelle", "Cash App"],
    fulfillment: "Pickup only",
  },

  // Texas cottage-food label wording. Shown in the footer because the kitchen is home-based.
  cottageFoodDisclosure:
    "Made in a home kitchen that is not inspected by the Texas Department of State Health Services or a local health department.",

  status: {
    acceptingOrders: true,
  },
} as const;

export const emailDisplay = business.contact.email.toLowerCase();
export const mailtoHref = `mailto:${business.contact.email}?subject=${encodeURIComponent(
  "Order inquiry - Dovey Cakes Co."
)}`;
