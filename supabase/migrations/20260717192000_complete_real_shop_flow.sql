-- Real shop checkout, reservations, order lifecycle and secure inventory operations
alter type public.order_status add value if not exists 'ready_for_pickup';
alter type public.order_status add value if not exists 'expired';

create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists stock_movements_order_idx on public.stock_movements(order_id);

drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = (select auth.uid()))
  or (select public.is_urbtrain_admin())
);
drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders for select to authenticated using (user_id = (select auth.uid()) or (select public.is_urbtrain_admin()));
drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders" on public.orders for all to authenticated using ((select public.is_urbtrain_admin())) with check ((select public.is_urbtrain_admin()));
drop policy if exists "Public reads available products" on public.products;
create policy "Public reads available products" on public.products for select using (active = true or (select public.is_urbtrain_admin()));
drop policy if exists "Public reads available variants" on public.product_variants;
create policy "Public reads available variants" on public.product_variants for select using (
  (active = true and exists (select 1 from public.products where products.id = product_variants.product_id and products.active = true))
  or (select public.is_urbtrain_admin())
);

create or replace function public.release_expired_shop_orders()
returns integer language plpgsql security definer set search_path = public as $$
declare item record; expired_order record; released_count integer := 0;
begin
  for expired_order in select id, order_number from public.orders
    where status in ('new','in_conversation','confirmed','ready_for_pickup') and reservation_expires_at is not null and reservation_expires_at <= now() for update
  loop
    for item in select product_variant_id, quantity from public.order_items where order_id = expired_order.id and product_variant_id is not null
    loop
      update public.product_variants set reserved_quantity = greatest(0, reserved_quantity - item.quantity), updated_at = now() where id = item.product_variant_id;
      insert into public.stock_movements(product_variant_id,order_id,movement_type,quantity_delta,reserved_delta,reason)
      values(item.product_variant_id,expired_order.id,'release',0,-item.quantity,'Reserva expirada do pedido ' || coalesce(expired_order.order_number,expired_order.id::text));
    end loop;
    update public.orders set status = 'expired', updated_at = now() where id = expired_order.id;
    released_count := released_count + 1;
  end loop;
  return released_count;
end;
$$;

create or replace function public.place_shop_order(p_items jsonb, p_fulfillment_method text, p_notes text default null)
returns table(order_id uuid, order_number text, total_cents integer)
language plpgsql security definer set search_path = public as $$
declare current_user uuid := auth.uid(); item jsonb; variant record; new_order_id uuid; new_order_number text; calculated_total integer := 0; requested_quantity integer; customer record;
begin
  if current_user is null then raise exception 'Você precisa entrar para finalizar o pedido.' using errcode = '28000'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Seu carrinho está vazio.'; end if;
  if p_fulfillment_method not in ('retirada','entrega') then raise exception 'Forma de recebimento inválida.'; end if;
  perform public.release_expired_shop_orders();
  select full_name, whatsapp into customer from public.profiles where id = current_user;
  new_order_number := 'URB-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.urbtrain_order_number_seq')::text, 6, '0');
  insert into public.orders(user_id,customer_name,whatsapp,fulfillment_method,status,total_cents,notes,order_number,reservation_expires_at)
  values(current_user,coalesce(customer.full_name,auth.jwt()->>'email','Membro URBTRAIN'),coalesce(customer.whatsapp,''),p_fulfillment_method,'new',0,nullif(left(coalesce(p_notes,''),1000),''),new_order_number,now()+interval '24 hours') returning id into new_order_id;
  for item in select value from jsonb_array_elements(p_items)
  loop
    requested_quantity := (item->>'quantity')::integer;
    if requested_quantity is null or requested_quantity < 1 or requested_quantity > 99 or nullif(item->>'variant_id','') is null then raise exception 'Item do pedido inválido.'; end if;
    select v.id,v.label,v.stock_quantity,v.reserved_quantity,p.name,p.price_cents into variant from public.product_variants v join public.products p on p.id=v.product_id
      where v.id=(item->>'variant_id')::uuid and v.active=true and p.active=true for update of v;
    if not found then raise exception 'Um item do carrinho não está mais disponível.'; end if;
    if variant.stock_quantity-variant.reserved_quantity < requested_quantity then raise exception 'Estoque insuficiente para % (%).',variant.name,variant.label; end if;
    update public.product_variants set reserved_quantity=reserved_quantity+requested_quantity,updated_at=now() where id=variant.id;
    insert into public.order_items(order_id,product_variant_id,product_name,variant_label,unit_price_cents,quantity,subtotal_cents) values(new_order_id,variant.id,variant.name,variant.label,variant.price_cents,requested_quantity,variant.price_cents*requested_quantity);
    insert into public.stock_movements(product_variant_id,order_id,movement_type,quantity_delta,reserved_delta,reason,created_by) values(variant.id,new_order_id,'reservation',0,requested_quantity,'Reserva do pedido ' || new_order_number,current_user);
    calculated_total := calculated_total + variant.price_cents*requested_quantity;
  end loop;
  update public.orders set total_cents=calculated_total,updated_at=now() where id=new_order_id;
  return query select new_order_id,new_order_number,calculated_total;
end;
$$;

create or replace function public.set_shop_order_status(p_order_id uuid, p_status public.order_status)
returns void language plpgsql security definer set search_path = public as $$
declare existing_order record; item record;
begin
  if not public.is_urbtrain_admin() then raise exception 'Ação restrita a administradores.' using errcode='42501'; end if;
  select id,status,order_number into existing_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'Pedido não encontrado.'; end if;
  if existing_order.status in ('cancelled','expired','delivered') and existing_order.status <> p_status then raise exception 'Este pedido já foi encerrado.'; end if;
  if existing_order.status=p_status then return; end if;
  if p_status in ('cancelled','expired') and existing_order.status not in ('cancelled','expired','delivered') then
    for item in select product_variant_id,quantity from public.order_items where order_id=p_order_id and product_variant_id is not null loop
      update public.product_variants set reserved_quantity=greatest(0,reserved_quantity-item.quantity),updated_at=now() where id=item.product_variant_id;
      insert into public.stock_movements(product_variant_id,order_id,movement_type,quantity_delta,reserved_delta,reason,created_by) values(item.product_variant_id,p_order_id,'release',0,-item.quantity,'Liberação do pedido ' || coalesce(existing_order.order_number,p_order_id::text),auth.uid());
    end loop;
  elsif p_status='delivered' and existing_order.status not in ('delivered','cancelled','expired') then
    for item in select product_variant_id,quantity from public.order_items where order_id=p_order_id and product_variant_id is not null loop
      update public.product_variants set stock_quantity=stock_quantity-item.quantity,reserved_quantity=reserved_quantity-item.quantity,updated_at=now() where id=item.product_variant_id and stock_quantity>=item.quantity and reserved_quantity>=item.quantity;
      if not found then raise exception 'Não foi possível baixar o estoque deste pedido.'; end if;
      insert into public.stock_movements(product_variant_id,order_id,movement_type,quantity_delta,reserved_delta,reason,created_by) values(item.product_variant_id,p_order_id,'sale',-item.quantity,-item.quantity,'Venda concluída: ' || coalesce(existing_order.order_number,p_order_id::text),auth.uid());
    end loop;
  end if;
  update public.orders set status=p_status,updated_at=now() where id=p_order_id;
end;
$$;

create or replace function public.adjust_shop_stock(p_variant_id uuid, p_quantity_delta integer, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_urbtrain_admin() then raise exception 'Ação restrita a administradores.' using errcode='42501'; end if;
  if p_quantity_delta=0 or length(trim(coalesce(p_reason,'')))<2 then raise exception 'Ajuste inválido.'; end if;
  update public.product_variants set stock_quantity=stock_quantity+p_quantity_delta,updated_at=now() where id=p_variant_id and stock_quantity+p_quantity_delta>=reserved_quantity;
  if not found then raise exception 'Ajuste deixaria o saldo abaixo das reservas ou a variação não existe.'; end if;
  insert into public.stock_movements(product_variant_id,movement_type,quantity_delta,reserved_delta,reason,created_by) values(p_variant_id,'adjustment',p_quantity_delta,0,left(trim(p_reason),160),auth.uid());
end;
$$;

revoke all on function public.release_expired_shop_orders() from public;
revoke all on function public.place_shop_order(jsonb,text,text) from public;
revoke all on function public.set_shop_order_status(uuid,public.order_status) from public;
revoke all on function public.adjust_shop_stock(uuid,integer,text) from public;
grant execute on function public.release_expired_shop_orders() to authenticated;
grant execute on function public.place_shop_order(jsonb,text,text) to authenticated;
grant execute on function public.set_shop_order_status(uuid,public.order_status) to authenticated;
grant execute on function public.adjust_shop_stock(uuid,integer,text) to authenticated;
