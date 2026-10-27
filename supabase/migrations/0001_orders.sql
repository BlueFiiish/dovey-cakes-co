-- Dovey Cakes Co. - v2 order log. Written only by the Stripe webhook (service role);
-- nothing is readable from the browser until an owner dashboard/auth exists.
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  stripe_session_id text unique not null,
  status            text not null default 'paid',          -- paid | unpaid | refunded | picked_up
  amount_cents      integer not null default 0,
  currency          text not null default 'usd',
  customer_name     text,
  email             text,
  phone             text,
  pickup_note       text,
  lines             jsonb not null default '[]'::jsonb,     -- [{ id, qty, cents }]
  source            text not null default 'website-shop',
  picked_up_at      timestamptz
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_email_idx on public.orders (email);

alter table public.orders enable row level security;
-- No policies on purpose: only the service role (the webhook) can read or write.
-- When accounts arrive (Supabase Auth), add:
--   create policy "own orders" on public.orders for select using (auth.jwt() ->> 'email' = email);
