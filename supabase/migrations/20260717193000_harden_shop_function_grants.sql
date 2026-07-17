-- Prevent unauthenticated calls to SECURITY DEFINER shop functions
revoke execute on function public.is_urbtrain_admin() from anon;
revoke execute on function public.adjust_shop_stock(uuid,integer,text) from anon;
revoke execute on function public.place_shop_order(jsonb,text,text) from anon;
revoke execute on function public.release_expired_shop_orders() from anon;
revoke execute on function public.set_shop_order_status(uuid,public.order_status) from anon;