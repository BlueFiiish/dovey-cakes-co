# Dovey Cakes Co. – v2 setup (shop, QR cart, AI cake ideas)

The `main` branch is the live static site on GitHub Pages. This branch (`v2-shop-ai`) adds
three things that need accounts and keys only a human can create. Everything below is the
manual part; the code is already written and type-checks (`npm run check:functions`).

What's on this branch:

| Feature | Page | Backend | Works on GitHub Pages? |
|---|---|---|---|
| Pop-up cart (QR target) | `/shop/` | `functions/api/checkout.ts` (Stripe Checkout) | Yes, in "pay at the cart" mode (shows total + Cash App link once the cashtag is set) |
| Paid-order log + email | – | `functions/api/stripe-webhook.ts` → Supabase + Resend | No (needs Cloudflare) |
| Picture your cake (AI) | `/cake-ideas/` | `functions/api/cake-idea.ts` (Claude + image model) | No: page shows "not switched on yet" |

## 0. Decide the host (once)

GitHub Pages can't run functions. Move to **Cloudflare Pages** (free) and keep the same repo:

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → `BlueFiiish/dovey-cakes-co`.
2. Build command `npm run build`, output directory `dist`, production branch `main` (merge this branch when ready).
3. Environment variables (build): `SITE_URL=https://<project>.pages.dev` (later her domain), `SITE_BASE=/`.
4. Settings → Functions → Compatibility flags: `nodejs_compat` (also in `wrangler.toml`).
5. Secrets (Settings → Environment variables → encrypt): see `.dev.vars.example`. Add them as you finish each step below.
6. When she buys a domain: Custom domains → add it, then change `SITE_URL`.

Re-print the QR code only after the final domain exists (`assets/qr-shop.png` in the vault points at the GitHub Pages URL for now).

## 1. Pop-up cart + payments (Stripe)

Needs her, not you: a Stripe account is in the seller's name (SSN/EIN, bank account for payouts).

1. She creates https://dashboard.stripe.com (individual/sole proprietor is fine).
2. Settings → Payment methods: turn on Cards, **Apple Pay**, **Google Pay**, **Cash App Pay**. (Link is on by default.)
3. Developers → API keys → copy the **secret key** → Cloudflare secret `STRIPE_SECRET_KEY`.
4. Developers → Webhooks → Add endpoint `https://<domain>/api/stripe-webhook`, event `checkout.session.completed` → copy the signing secret → `STRIPE_WEBHOOK_SECRET`.
5. Test with the `sk_test_` key and card `4242 4242 4242 4242` first, then swap to live keys.

Content still missing in `src/data/shop.ts`:
- `cashtag`: her Cash App cashtag (for the pay-at-the-cart fallback).
- Cookie prices (`priceCents` is `null` → "price at the cart" until set).
- `minimumCents` is $10; change if she wants single-item online orders (Stripe takes 2.9% + 30¢ per charge).

Texas cottage-food note: online ordering is allowed, but the food must be handed over in person, which the porch pickup covers.

## 2. Order log (Supabase) + order emails (Resend)

1. https://supabase.com → new project (free) → SQL editor → run `supabase/migrations/0001_orders.sql`.
2. Project settings → API → copy the **URL** and the **service_role** key → secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Never put the service key in the site; only the webhook uses it.
3. Emails: https://resend.com (free, 100/day) → API key → `RESEND_API_KEY`; set `NOTIFY_EMAIL` to her inbox. Without a verified domain, set `NOTIFY_FROM` to `Dovey Cakes Co. <onboarding@resend.dev>` (Resend's test sender) or verify her domain once she has one.

Accounts (Google / Apple sign-in) are **not** built yet. When wanted: Supabase Auth with the Google provider (free) and Apple (needs an Apple Developer membership, $99/yr), plus an `/account/` page that reads `orders` where `email = auth email` (policy is sketched at the bottom of the migration). Keep guest checkout as the default either way.

## 3. Picture your cake (AI)

1. Anthropic: https://console.anthropic.com → API key → `ANTHROPIC_API_KEY`. The function uses Claude Opus 5.5 at low effort with structured output; a short request is roughly a cent.
2. Image model, pick one:
   - OpenAI `gpt-image-1`: https://platform.openai.com → key → `OPENAI_API_KEY`, `IMAGE_PROVIDER=openai` (about 4–7¢ per medium 1024² image).
   - Google Imagen 4: https://aistudio.google.com → key → `GEMINI_API_KEY`, `IMAGE_PROVIDER=gemini`.
   Prototype first: paste the `SYSTEM` prompt from `functions/api/cake-idea.ts` and a customer description into the Artlist image tool on your PC and see whether the results look like her cakes before paying for an API.
3. Abuse guards (do these before announcing the page):
   - Cloudflare Turnstile (free): Turnstile → add site → copy site key into the Pages **build** env as `PUBLIC_TURNSTILE_SITE_KEY` and the secret into `TURNSTILE_SECRET_KEY`.
   - Per-IP rate limit: uncomment the `[[ratelimits]]` block in `wrangler.toml`.
   - Daily cap: create a KV namespace, uncomment `[[kv_namespaces]]`, set `IDEA_DAILY_CAP` (default 100 images/day).
   - Set a monthly spend limit in both the Anthropic and image-provider dashboards.

## 4. Local testing

```
npm install
npm run build
cp .dev.vars.example .dev.vars   # fill in test keys
npx wrangler pages dev dist      # serves the site + /api/* on http://localhost:8788
```

Node is not installed system-wide on the MacBook; a Node 22 binary was used from a temp folder. `brew install node` tried to compile Python from source and was stopped; a prebuilt install (`brew install node` on a better day, or the pkg from nodejs.org) is the fix.

## 5. Still open from v1

- Web3Forms access key for the order form (`src/pages/order.astro`, falls back to mailto).
- Confirm the order email, serving chart and policy wording with her.
- `src/data/popups.ts` → `next` when a pop-up date is known.
- Her real logo file; a domain; Google Business Profile; retire the old J.V. Creations site.
