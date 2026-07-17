-- Applied to production: add_real_shop_inventory
alter table public.products add column if not exists category text not null default 'Geral', add column if not exists slug text, add column if not exists updated_at timestamptz not null default now();
alter table public.product_variants add column if not exists sku text, add column if not exists stock_quantity integer not null default 0 check (stock_quantity >= 0), add column if not exists reserved_quantity integer not null default 0 check (reserved_quantity >= 0), add column if not exists low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0), add column if not exists updated_at timestamptz not null default now();
create unique index if not exists product_variants_sku_key on public.product_variants (sku) where sku is not null;
create unique index if not exists products_slug_key on public.products (slug) where slug is not null;
alter table public.orders add column if not exists order_number text, add column if not exists notes text, add column if not exists reservation_expires_at timestamptz;
create unique index if not exists orders_order_number_key on public.orders (order_number) where order_number is not null;
create index if not exists orders_user_id_created_at_idx on public.orders (user_id, created_at desc);
alter table public.order_items add column if not exists product_variant_id uuid references public.product_variants(id);
do $$ begin create type public.stock_movement_type as enum ('initial','adjustment','reservation','release','sale','return'); exception when duplicate_object then null; end $$;
create table if not exists public.stock_movements (id uuid primary key default gen_random_uuid(),product_variant_id uuid not null references public.product_variants(id),order_id uuid references public.orders(id),movement_type public.stock_movement_type not null,quantity_delta integer not null default 0,reserved_delta integer not null default 0,reason text not null,created_by uuid references public.profiles(id),created_at timestamptz not null default now());
alter table public.stock_movements enable row level security;
create index if not exists stock_movements_variant_created_idx on public.stock_movements(product_variant_id,created_at desc);
create sequence if not exists public.urbtrain_order_number_seq;
create or replace function public.is_urbtrain_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'); $$;
revoke all on function public.is_urbtrain_admin() from public; grant execute on function public.is_urbtrain_admin() to authenticated;
drop policy if exists "Admins manage stock movements" on public.stock_movements;
create policy "Admins manage stock movements" on public.stock_movements for all to authenticated using ((select public.is_urbtrain_admin())) with check ((select public.is_urbtrain_admin()));
