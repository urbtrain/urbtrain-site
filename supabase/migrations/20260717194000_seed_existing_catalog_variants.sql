-- Existing catalog starts with zero confirmed units; enter the physical count in Admin > Loja e estoque.
update public.products set category = case name when 'Camisa URBTRAIN' then 'Vestuário' when 'Top URBTRAIN' then 'Vestuário' when 'Bone URB' then 'Acessório' when 'Meias esportivas' then 'Performance' else category end where name in ('Camisa URBTRAIN','Top URBTRAIN','Bone URB','Meias esportivas');

insert into public.product_variants(product_id,label,stock_quantity,reserved_quantity,low_stock_threshold,active)
select p.id, sizes.label, 0, 0, 3, true
from public.products p
join lateral (
  select unnest(case p.name
    when 'Camisa URBTRAIN' then array['P','M','G','GG']
    when 'Top URBTRAIN' then array['P','M','G']
    when 'Bone URB' then array['Único']
    when 'Meias esportivas' then array['34-38','39-43']
    else array[]::text[]
  end) as label
) sizes on true
where p.name in ('Camisa URBTRAIN','Top URBTRAIN','Bone URB','Meias esportivas')
and not exists (select 1 from public.product_variants v where v.product_id = p.id and v.label = sizes.label);