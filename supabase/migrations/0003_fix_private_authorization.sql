-- Fix authorization after moving helper functions to the private schema.
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "profiles own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "public calendar" on public.calendar_months;
drop policy if exists "public training" on public.training_events;
drop policy if exists "public products" on public.products;
drop policy if exists "public variants" on public.product_variants;
drop policy if exists "public gallery" on public.gallery_items;
drop policy if exists "public settings" on public.site_settings;
drop policy if exists "admin calendar" on public.calendar_months;
drop policy if exists "admin training" on public.training_events;
drop policy if exists "admin products" on public.products;
drop policy if exists "admin variants" on public.product_variants;
drop policy if exists "admin gallery" on public.gallery_items;
drop policy if exists "admin settings" on public.site_settings;
drop policy if exists "orders own" on public.orders;
drop policy if exists "orders create own" on public.orders;
drop policy if exists "order items create own" on public.order_items;
drop policy if exists "order items own" on public.order_items;
drop policy if exists "orders admin update" on public.orders;

create policy "profiles select own or admin" on public.profiles for select to authenticated using ((select auth.uid())=id or (select private.is_admin()));
create policy "profiles update own or admin" on public.profiles for update to authenticated using ((select auth.uid())=id or (select private.is_admin())) with check ((select auth.uid())=id or (select private.is_admin()));
create policy "calendar public read" on public.calendar_months for select to anon, authenticated using (published or (select private.is_admin()));
create policy "training public read" on public.training_events for select to anon, authenticated using (published or (select private.is_admin()));
create policy "products public read" on public.products for select to anon, authenticated using (active or (select private.is_admin()));
create policy "variants public read" on public.product_variants for select to anon, authenticated using (active or (select private.is_admin()));
create policy "gallery public read" on public.gallery_items for select to anon, authenticated using (published or (select private.is_admin()));
create policy "settings public read" on public.site_settings for select to anon, authenticated using (true);
create policy "admin calendar manage" on public.calendar_months for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin training manage" on public.training_events for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin products manage" on public.products for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin variants manage" on public.product_variants for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin gallery manage" on public.gallery_items for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin settings manage" on public.site_settings for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "orders select own or admin" on public.orders for select to authenticated using (user_id=(select auth.uid()) or (select private.is_admin()));
create policy "orders insert own" on public.orders for insert to authenticated with check (user_id=(select auth.uid()));
create policy "order items insert own" on public.order_items for insert to authenticated with check (exists(select 1 from public.orders o where o.id=order_id and o.user_id=(select auth.uid())));
create policy "order items select own or admin" on public.order_items for select to authenticated using (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=(select auth.uid()) or (select private.is_admin()))));
create policy "orders admin update" on public.orders for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- Storage remains private; only admins may write objects.
drop policy if exists "admin media write" on storage.objects;
create policy "admin media manage" on storage.objects for all to authenticated using (bucket_id='public-media' and (select private.is_admin())) with check (bucket_id='public-media' and (select private.is_admin()));