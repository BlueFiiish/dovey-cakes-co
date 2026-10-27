// POST /api/checkout  { lines: [{ id, qty }] }  ->  { url }  (a Stripe Checkout Session)
//
// Prices come from src/data/shop.ts on the server, never from the browser. Stripe Checkout
// shows Apple Pay, Google Pay, cards and Cash App Pay according to the payment methods turned
// on in the Stripe dashboard. Returns 503 until STRIPE_SECRET_KEY is set, which the /shop/ page
// treats as "pay at the cart".
import { priceCart, shop, type CartLine } from '../../src/data/shop';
import { bad, json, readJson, siteOrigin } from '../_lib/http';

interface Env {
  STRIPE_SECRET_KEY?: string;
  SITE_URL?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.STRIPE_SECRET_KEY) return bad('checkout_not_configured', 503);

  const body = await readJson<{ lines?: unknown }>(request);
  const rawLines = Array.isArray(body?.lines) ? body!.lines : null;
  if (!rawLines || rawLines.length === 0 || rawLines.length > 20) return bad('invalid_cart');

  const lines: CartLine[] = rawLines
    .filter((l): l is { id: string; qty: number } => !!l && typeof l === 'object' && typeof (l as any).id === 'string')
    .map((l) => ({ id: l.id, qty: Number(l.qty) }));

  const cart = priceCart(lines);
  if (cart.lines.length === 0) return bad('invalid_cart');
  if (cart.unpriced.length) return bad('unpriced_items');
  if (cart.subtotalCents < shop.minimumCents) return bad('below_minimum');

  const origin = siteOrigin(request, env);
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('success_url', `${origin}/shop/thanks/?session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${origin}/shop/?cancelled=1`);
  params.set('phone_number_collection[enabled]', 'true');
  params.set('submit_type', 'pay');
  params.set('custom_fields[0][key]', 'pickup');
  params.set('custom_fields[0][label][type]', 'custom');
  params.set('custom_fields[0][label][custom]', 'Pickup time or a note for the baker');
  params.set('custom_fields[0][type]', 'text');
  params.set('custom_fields[0][optional]', 'true');
  params.set('metadata[source]', 'website-shop');
  params.set('metadata[lines]', JSON.stringify(cart.lines.map((l) => ({ id: l.id, qty: l.qty, cents: l.lineCents }))));

  cart.lines.forEach((line, i) => {
    params.set(`line_items[${i}][quantity]`, '1');
    params.set(`line_items[${i}][price_data][currency]`, 'usd');
    params.set(`line_items[${i}][price_data][unit_amount]`, String(line.lineCents));
    params.set(`line_items[${i}][price_data][product_data][name]`, `${line.name} x ${line.qty}`);
    params.set(`line_items[${i}][price_data][product_data][description]`, line.breakdown);
  });

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'content-type': 'application/x-www-form-urlencoded',
      'idempotency-key': crypto.randomUUID(),
    },
    body: params,
  });
  const session = (await res.json().catch(() => ({}))) as { url?: string; error?: { message?: string } };
  if (!res.ok || !session.url) {
    console.error('stripe checkout error', res.status, session.error?.message);
    return bad('stripe_error', 502);
  }
  return json({ url: session.url });
};
