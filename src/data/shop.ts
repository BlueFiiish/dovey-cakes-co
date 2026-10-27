// Dovey Cakes Co. - the pop-up shop (QR cart). Fixed-price items only: cake pops and the
// cookie menu of the month. Custom cakes stay a quote (see order-form.ts).
//
// This file is imported by the /shop/ page, the client-side cart script AND the Cloudflare
// checkout function, so every price the customer sees is the price the server charges.
import { cookieMenu, cakePops } from './menu';

export type ShopCategory = 'pop' | 'cookie';

export interface ShopItem {
  id: string;
  name: string;
  desc?: string;
  category: ShopCategory;
  /** Cents. `null` = price not confirmed yet: the item can be picked, but is paid at the cart. */
  priceCents: number | null;
}

export interface CartLine {
  id: string;
  qty: number;
}

export const shop = {
  /** Her Cash App cashtag for the no-Stripe fallback, e.g. "$doveycakesco". TODO: ask her. */
  cashtag: null as string | null,
  /** Minimum online order, so card fees don't eat a single $3 cake pop. */
  minimumCents: 1000,
  /** Max quantity per line (abuse guard). */
  maxQty: 24,
  items: [
    {
      id: 'cake-pop',
      name: 'Cake pop',
      desc: `Flavors rotate each pop-up. $${cakePops.priceEach} each or ${cakePops.bundle.count} for $${cakePops.bundle.priceUsd}.`,
      category: 'pop',
      priceCents: cakePops.priceEach * 100,
    },
    ...cookieMenu.items.map((c) => ({
      id: `cookie-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
      name: c.name,
      desc: c.desc,
      category: 'cookie' as const,
      // TODO: confirm cookie prices with her, then set them (cents) and online payment covers cookies too.
      priceCents: null,
    })),
  ] satisfies ShopItem[],
  bundles: [{ itemId: 'cake-pop', qty: cakePops.bundle.count, priceCents: cakePops.bundle.priceUsd * 100 }],
};

export interface PricedLine {
  id: string;
  name: string;
  qty: number;
  /** Line total in cents, or null if the item has no confirmed price. */
  lineCents: number | null;
  /** Human breakdown, e.g. "4 for $10 + 2 x $3". */
  breakdown: string;
}

export interface PricedCart {
  lines: PricedLine[];
  /** Sum of priced lines. */
  subtotalCents: number;
  /** Names of lines that have no price yet (paid at the cart). */
  unpriced: string[];
  /** True when every line is priced and the subtotal meets the minimum. */
  payableOnline: boolean;
}

const money = (cents: number) => (cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`);

export function priceCart(input: CartLine[]): PricedCart {
  const byId = new Map(shop.items.map((i) => [i.id, i]));
  const lines: PricedLine[] = [];
  let subtotalCents = 0;
  const unpriced: string[] = [];

  for (const raw of input) {
    const item = byId.get(raw.id);
    const qty = Math.min(shop.maxQty, Math.max(0, Math.floor(Number(raw.qty) || 0)));
    if (!item || qty === 0) continue;

    if (item.priceCents === null) {
      lines.push({ id: item.id, name: item.name, qty, lineCents: null, breakdown: `${qty} x price at the cart` });
      unpriced.push(item.name);
      continue;
    }

    const bundle = shop.bundles.find((b) => b.itemId === item.id);
    let lineCents = qty * item.priceCents;
    let breakdown = `${qty} x ${money(item.priceCents)}`;
    if (bundle && qty >= bundle.qty) {
      const sets = Math.floor(qty / bundle.qty);
      const rest = qty % bundle.qty;
      lineCents = sets * bundle.priceCents + rest * item.priceCents;
      breakdown = `${sets} x (${bundle.qty} for ${money(bundle.priceCents)})${rest ? ` + ${rest} x ${money(item.priceCents)}` : ''}`;
    }
    lines.push({ id: item.id, name: item.name, qty, lineCents, breakdown });
    subtotalCents += lineCents;
  }

  return {
    lines,
    subtotalCents,
    unpriced,
    payableOnline: lines.length > 0 && unpriced.length === 0 && subtotalCents >= shop.minimumCents,
  };
}

export { money };
