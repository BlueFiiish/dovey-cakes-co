// POST /api/stripe-webhook  (Stripe -> us)
// Verifies the Stripe signature, then on checkout.session.completed logs the order to Supabase
// and emails the baker through Resend. Both sinks are optional: whichever secrets exist are used.
import { bad, json } from '../_lib/http';

interface Env {
  STRIPE_WEBHOOK_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
  NOTIFY_FROM?: string;
}

interface CheckoutSession {
  id: string;
  amount_total: number | null;
  currency: string | null;
  payment_status: string;
  customer_details?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  custom_fields?: { key: string; text?: { value?: string | null } }[];
  metadata?: Record<string, string>;
}

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function verifyStripeSignature(payload: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false; // 5-minute replay window
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = hex(await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${payload}`)));
  if (sig.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.STRIPE_WEBHOOK_SECRET) return bad('webhook_not_configured', 503);
  const payload = await request.text();
  const ok = await verifyStripeSignature(payload, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return bad('bad_signature', 400);

  const event = JSON.parse(payload) as { type: string; data: { object: CheckoutSession } };
  if (event.type !== 'checkout.session.completed') return json({ received: true });

  const s = event.data.object;
  let lines: unknown = [];
  try {
    lines = JSON.parse(s.metadata?.lines || '[]');
  } catch {
    /* keep [] */
  }
  const order = {
    stripe_session_id: s.id,
    status: s.payment_status === 'paid' ? 'paid' : s.payment_status,
    amount_cents: s.amount_total ?? 0,
    currency: s.currency ?? 'usd',
    customer_name: s.customer_details?.name ?? null,
    email: s.customer_details?.email ?? null,
    phone: s.customer_details?.phone ?? null,
    pickup_note: s.custom_fields?.find((f) => f.key === 'pickup')?.text?.value ?? null,
    lines,
    source: s.metadata?.source ?? 'website-shop',
  };

  const tasks: Promise<unknown>[] = [];

  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    tasks.push(
      fetch(`${env.SUPABASE_URL}/rest/v1/orders?on_conflict=stripe_session_id`, {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'content-type': 'application/json',
          prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(order),
      }).then((r) => {
        if (!r.ok) console.error('supabase insert failed', r.status);
      })
    );
  }

  if (env.RESEND_API_KEY && env.NOTIFY_EMAIL) {
    const items = (Array.isArray(lines) ? lines : [])
      .map((l: any) => `- ${l.id} x ${l.qty}`)
      .join('\n');
    const text =
      `New pop-up order (${(order.amount_cents / 100).toFixed(2)} ${order.currency.toUpperCase()}, ${order.status})\n\n` +
      `${items}\n\nName: ${order.customer_name ?? '-'}\nEmail: ${order.email ?? '-'}\nPhone: ${order.phone ?? '-'}\n` +
      `Pickup note: ${order.pickup_note ?? '-'}\n\nStripe session: ${s.id}`;
    tasks.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from: env.NOTIFY_FROM || 'Dovey Cakes Co. <onboarding@resend.dev>',
          to: [env.NOTIFY_EMAIL],
          subject: `New pop-up order: $${(order.amount_cents / 100).toFixed(2)}`,
          text,
        }),
      }).then((r) => {
        if (!r.ok) console.error('resend failed', r.status);
      })
    );
  }

  await Promise.all(tasks);
  return json({ received: true });
};
