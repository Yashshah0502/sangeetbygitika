-- Add special pricing support to products
alter table public.products
  add column if not exists special_price numeric,
  add column if not exists special_price_message text;

comment on column public.products.special_price is 'Optional discounted price shown to customers when present.';
comment on column public.products.special_price_message is 'Optional label shown with the special price (e.g., Limited time only).';
