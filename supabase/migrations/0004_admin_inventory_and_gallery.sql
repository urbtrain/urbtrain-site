-- Inventory and gallery storage for the administrative hub.
alter table public.product_variants
  add column if not exists stock_quantity integer not null default 0 check (stock_quantity >= 0),
  add column if not exists low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0);

insert into public.product_variants (product_id, label, active, stock_quantity, low_stock_threshold)
select p.id, 'Único', true, 0, 3
from public.products p
where not exists (select 1 from public.product_variants v where v.product_id = p.id);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity_delta integer not null check (quantity_delta <> 0),
  reason text not null check (char_length(reason) between 2 and 160),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.stock_movements enable row level security;
create policy "admin stock movements manage" on public.stock_movements
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create policy "public gallery files read" on storage.objects
  for select to public using (bucket_id = 'gallery');
create policy "admin gallery files insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery' and (select private.is_admin()));
create policy "admin gallery files update" on storage.objects
  for update to authenticated using (bucket_id = 'gallery' and (select private.is_admin()))
  with check (bucket_id = 'gallery' and (select private.is_admin()));
create policy "admin gallery files delete" on storage.objects
  for delete to authenticated using (bucket_id = 'gallery' and (select private.is_admin()));
