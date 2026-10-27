// Static search index, built once at build time from the data files. The header search
// dialog fetches it on first open. No server, no library: see SearchDialog.astro.
import type { APIRoute } from 'astro';
import { business } from '../data/business';
import { gallery, tagLabels, tagOrder } from '../data/gallery';
import { flavors, fillings, cookieMenu, cakePops } from '../data/menu';
import { link } from '../lib/link';

export interface SearchItem {
  /** Title shown in results. */
  t: string;
  /** Subtitle. */
  s?: string;
  /** Extra keywords (not shown). */
  k?: string;
  /** Destination. */
  u: string;
  /** Group label. */
  g: string;
}

export const GET: APIRoute = () => {
  const items: SearchItem[] = [
    ...gallery.map((c) => ({
      t: c.title,
      s: c.note,
      k: `cake ${c.tags.map((t) => tagLabels[t]).join(' ')}`,
      u: link(`/cakes/#${c.slug}`),
      g: 'Cake',
    })),
    ...tagOrder.map((t) => ({
      t: tagLabels[t],
      s: `${gallery.filter((c) => c.tags.includes(t)).length} cakes`,
      k: 'cakes category type style',
      u: link(`/cakes/?tag=${t}`),
      g: 'Cake style',
    })),
    ...flavors.map((f) => ({
      t: `${f.name} cake`,
      s: f.upchargeUsd === null ? 'Quoted per request' : f.upchargeUsd ? `+$${f.upchargeUsd}` : 'Standard flavor',
      k: 'flavor flavors sponge',
      u: link('/menu/#cakes'),
      g: 'Cake flavor',
    })),
    ...fillings.map((f) => ({
      t: f,
      s: 'Cake filling',
      k: 'filling fillings',
      u: link('/menu/#cakes'),
      g: 'Filling',
    })),
    ...cookieMenu.items.map((c) => ({
      t: c.name,
      s: c.desc,
      k: `cookie cookies ${cookieMenu.season} ${cookieMenu.title}`,
      u: link('/menu/#cookies'),
      g: 'Cookie',
    })),
    {
      t: 'Cake pops',
      s: `$${cakePops.priceEach} each or ${cakePops.bundle.count} for $${cakePops.bundle.priceUsd}`,
      k: 'cake pops pop-up treats',
      u: link('/menu/#cookies'),
      g: 'Treat',
    },
    { t: 'Start an order', s: 'Send your date, headcount and idea for a quote', k: 'order form quote request book', u: link('/order/'), g: 'Page' },
    { t: 'Porch pop-ups', s: popups(), k: 'popup pop up porch cart dates when where', u: link('/pop-ups/'), g: 'Page' },
    { t: 'Serving sizes', s: 'How big should the cake be?', k: 'servings size chart people tiers shapes', u: link('/menu/#sizes'), g: 'Page' },
    { t: 'Ordering & policy', s: 'Lead time, deposit, rush fee, pickup, allergens', k: 'policy deposit zelle cash app pickup allergy allergens rush', u: link('/menu/#policy'), g: 'Page' },
    { t: 'About', s: `The baker behind ${business.name}`, k: 'about story who', u: link('/about/'), g: 'Page' },
    { t: `TikTok ${business.contact.tiktok.handle}`, s: 'Videos, menus of the week and pop-up dates', k: 'tiktok social follow video', u: business.contact.tiktok.url, g: 'Social' },
  ];

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};

function popups(): string {
  return 'Cookies and cake pops from the cart, most weeks in Rosenberg';
}
