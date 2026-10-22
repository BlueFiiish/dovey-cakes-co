// Dovey Cakes Co. - menu data.
// Cake flavors, fillings, shapes, tiers and the serving chart come from her own flavor/policy
// cards (June 2026). The cookie menu is her "Menu of the week" TikTok post of 2026-10-13.
// Cake-pop pricing is from her TikTok ("$3 each or 4 for $10", Aug 2026). Prices in USD.

export const flavors = [
  { name: "Vanilla", upchargeUsd: 0 },
  { name: "Chocolate", upchargeUsd: 0 },
  { name: "Strawberry", upchargeUsd: 0 },
  { name: "Lemon", upchargeUsd: 0 },
  { name: "Red Velvet", upchargeUsd: 0 },
  { name: "Confetti", upchargeUsd: 0 },
  { name: "Coffee", upchargeUsd: 0 },
  { name: "Carrot", upchargeUsd: 5 },
  { name: "Oreo", upchargeUsd: 5 },
  { name: "Marble", upchargeUsd: 5 },
  { name: "Tres Leches", upchargeUsd: 5 },
  { name: "Custom", upchargeUsd: null }, // quoted per request
] as const;

export const fillings = [
  "Fresh Fruit (of choice)",
  "Cream Cheese",
  "Fresas con Crema",
  "Cookies n Cream",
  "Chocolate Ganache",
  "White Chocolate Ganache",
  "Nutella Mousse",
  "Peanut Butter Mousse",
  "Bavarian Cream",
  "Dulce de Leche Mousse",
  "Custom",
] as const;

export const shapes = ["Round", "Heart", "Square", "Sheet"] as const;
export const tiers = ["Single tier", "2 tier", "3 tier"] as const;

// Servings by diameter x layers. TODO confirm these match her cuts (reference chart).
export const servingChart = [
  { size: '6"', layers1: 5, layers2: 10, layers3: 15 },
  { size: '7"', layers1: 7, layers2: 15, layers3: 20 },
  { size: '8"', layers1: 10, layers2: 20, layers3: 30 },
  { size: '9"', layers1: 15, layers2: 30, layers3: 45 },
  { size: '10"', layers1: 18, layers2: 35, layers3: 50 },
  { size: '12"', layers1: 25, layers2: 50, layers3: 75 },
] as const;

export const servingChartNote =
  "Serving counts are approximate and based on standard party-size slices.";

export const addOns = {
  rushOrderUsd: 10,
  note: "Custom flavors, fillings and designs are quoted per request.",
} as const;

// ---- Cookies ---------------------------------------------------------------------------
// Seasonal menu, posted on TikTok 2026-10-13 ("Menu of the week!").
export const cookieMenu = {
  title: "October cookie menu",
  season: "Halloween",
  postedOn: "2026-10-13",
  items: [
    { name: "Cookies n Scream", desc: "Chocolate cookie with orange Oreos and white chocolate chips" },
    { name: "Witches Brew", desc: "Signature cookie with chocolate chips, coconut flakes, M&Ms and pretzels" },
    { name: "Haunted Peanuts", desc: "Peanut butter cookie with a Nutella peanut filling" },
    { name: "Love Potion", desc: "Red velvet cookie with cream cheese filling and white chocolate chips" },
    { name: "Ghostly S'mores", desc: "Vanilla cookie with chocolate chunks and a marshmallow center on a graham cracker" },
  ],
  note: "The cookie menu changes with the season. The current one is always on TikTok.",
} as const;

// ---- Cake pops -------------------------------------------------------------------------
export const cakePops = {
  priceEach: 3,
  bundle: { count: 4, priceUsd: 10 },
  note: "Flavors rotate with each pop-up; cinnamon roll and strawberry cheesecake have made appearances.",
} as const;
