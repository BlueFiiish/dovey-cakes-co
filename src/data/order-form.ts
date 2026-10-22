// Dovey Cakes Co. - order request form spec. This is an inquiry, NOT a checkout:
// she confirms, then the customer pays by Zelle or Cash App, then pickup.
// Rendered with Web3Forms (free) + a mailto fallback.

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "date" | "time" | "select" | "textarea" | "file";
  required: boolean;
  options?: readonly string[];
  help?: string;
  /** Only relevant for custom cakes; grouped under the "Cake details" heading. */
  cakeOnly?: boolean;
}

export const orderTypes = [
  "Custom cake",
  "Cookies",
  "Cake pops",
  "Mix of cake, cookies and pops",
] as const;

export const orderForm: FormField[] = [
  { name: "name", label: "Your name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone (optional)", type: "tel", required: false, help: "Only if you'd rather be texted." },

  { name: "orderType", label: "What would you like?", type: "select", required: true, options: orderTypes },
  { name: "quantity", label: "How many people, or how many pieces?", type: "text", required: true,
    help: "e.g. cake for 20, two dozen cookies, 30 cake pops" },
  { name: "pickupDate", label: "Pickup date", type: "date", required: true,
    help: "Please order at least 1 week ahead. Under a week adds a $10 rush fee." },
  { name: "pickupTime", label: "Preferred pickup time (optional)", type: "time", required: false },

  { name: "shape", label: "Cake shape", type: "select", required: false, cakeOnly: true,
    options: ["Round", "Heart", "Square", "Sheet"] },
  { name: "tiers", label: "Tiers", type: "select", required: false, cakeOnly: true,
    options: ["Single tier", "2 tier", "3 tier"] },
  { name: "flavor", label: "Cake flavor", type: "select", required: false, cakeOnly: true, options: ["See flavor list"] },
  { name: "filling", label: "Filling", type: "select", required: false, cakeOnly: true, options: ["See filling list"] },
  { name: "colorTheme", label: "Theme, colors or character", type: "text", required: false, cakeOnly: true,
    help: "e.g. vintage pink heart, Stitch, sage and cream" },

  { name: "inspo", label: "Inspiration picture(s)", type: "file", required: false,
    help: "Upload any photos of the look you want." },
  { name: "details", label: "Anything else?", type: "textarea", required: false,
    help: "Name or age on the cake, allergies, where you saw it on TikTok..." },
];

export const orderFormIntro =
  "Tell me what you're celebrating and I'll reply with a quote and your pickup date. " +
  "Once we agree, pay by Zelle or Cash App to lock it in, then pick up in Rosenberg.";
