-- ============================================================================
-- COCOLU · Datos de ejemplo (opcional). Refleja parte del mock; el resto se
-- puede cargar desde el panel admin. Idempotente por slug.
-- ============================================================================

-- ───────────────────────────── Categorías ──────────────────────────────────
insert into public.categories (slug, name, description, accent, sort_order, featured) values
  ('novias',   'Novias',   'Piezas diseñadas para el día que lo cambia todo.', 'from-ivory via-blush to-gold-soft/60',       1, true),
  ('anillos',  'Anillos',  'Del compromiso al día a día: aros que acompañan.', 'from-gold-soft/80 via-rose/45 to-rose-deep/30', 2, true),
  ('collares', 'Collares', 'Detalles cerca del corazón, en oro y plata.',      'from-blush via-rose/55 to-rose-deep/25',     3, true),
  ('aretes',   'Aretes',   'Desde lo minimalista hasta lo que ilumina la mirada.', 'from-ivory via-ivory-soft to-blush/60',   4, false),
  ('ofertas',  'Ofertas',  'Piezas seleccionadas de temporadas anteriores.',   'from-rose/30 via-blush to-gold-soft/50',     5, false)
on conflict (slug) do nothing;

-- ───────────────────────────── Productos ───────────────────────────────────
insert into public.products
  (slug, name, description, price, compare_at_price, category_id, season, status,
   stock, sku, rating, review_count, is_new, is_on_sale, details, tags)
values
  ('anillo-aurora', 'Anillo Aurora',
   'Solitario tallado a mano con moissanita de talla brillante.',
   890, null, (select id from public.categories where slug = 'novias'),
   'atemporal', 'active', 6, 'COC-NOV-AUR', 5.0, 38, true, false,
   '[{"title":"Características","items":["Moissanita 1.0 ct","Engaste de 4 garras","Oro de 18 quilates"]},
     {"title":"Cuidado","items":["Guardar en estuche individual","Evitar contacto con perfumes"]}]'::jsonb,
   '{compromiso,moissanita,solitario}'),

  ('anillo-solenne', 'Anillo Solenne',
   'Aro minimalista de líneas puras con un destello discreto.',
   320, null, (select id from public.categories where slug = 'anillos'),
   'verano', 'active', 11, 'COC-ANI-SOL', 4.0, 12, true, false,
   '[{"title":"Características","items":["Diseño minimalista","Acabado pulido espejo","Hipoalergénico"]},
     {"title":"Envío","items":["Envío estándar en 2–4 días"]}]'::jsonb,
   '{minimalista,diario}'),

  ('collar-lumiere', 'Collar Lumière',
   'Gargantilla con colgante de gota en oro.',
   380, null, (select id from public.categories where slug = 'collares'),
   'primavera', 'active', 10, 'COC-COL-LUM', 5.0, 27, true, false,
   '[{"title":"Características","items":["Cadena de 42 cm + 3 cm","Colgante de gota","Cierre de mosquetón"]},
     {"title":"Cuidado","items":["Quitar antes de dormir","Evitar perfumes y cremas"]}]'::jsonb,
   '{colgante,regalo}'),

  ('aretes-gota-de-rocio', 'Aretes Gota de Rocío',
   'Aretes colgantes con una perla cultivada que se mece con el movimiento.',
   230, null, (select id from public.categories where slug = 'aretes'),
   'primavera', 'active', 15, 'COC-ARE-GOT', 4.5, 15, false, false,
   '[{"title":"Características","items":["Perla cultivada de agua dulce","Cierre de presión seguro"]},
     {"title":"Envío","items":["Envío estándar en 2–4 días"]}]'::jsonb,
   '{perla,primavera}'),

  ('pulsera-estio', 'Pulsera Estío',
   'Pulsera tejida con hilo dorado y dije de sol.',
   95, 150, (select id from public.categories where slug = 'ofertas'),
   'verano', 'active', 20, 'COC-OFE-EST', 4.0, 41, false, true,
   '[{"title":"Características","items":["Hilo encerado","Dije de sol bañado en oro","Ajustable"]},
     {"title":"Devoluciones","items":["Producto de oferta: solo cambios por defecto"]}]'::jsonb,
   '{oferta,verano,pulsera}')
on conflict (slug) do nothing;

-- ───────────────────────────── Imágenes ────────────────────────────────────
-- Placeholders; reemplazar por URLs reales de Storage al subir fotos.
insert into public.product_images (product_id, url, alt, is_primary, position)
select p.id, v.url, v.alt, v.is_primary, v.position
from (values
  ('anillo-aurora',        '/images/products/aurora-1.jpg',  'Anillo Aurora de frente', true,  0),
  ('anillo-aurora',        '/images/products/aurora-2.jpg',  'Anillo Aurora de perfil', false, 1),
  ('anillo-solenne',       '/images/products/solenne-1.jpg', 'Anillo Solenne',          true,  0),
  ('collar-lumiere',       '/images/products/lumiere-1.jpg', 'Collar Lumière',          true,  0),
  ('collar-lumiere',       '/images/products/lumiere-2.jpg', 'Detalle del colgante',    false, 1),
  ('aretes-gota-de-rocio', '/images/products/gota-1.jpg',    'Aretes Gota de Rocío',    true,  0),
  ('pulsera-estio',        '/images/products/estio-1.jpg',   'Pulsera Estío',           true,  0)
) as v(slug, url, alt, is_primary, position)
join public.products p on p.slug = v.slug
where not exists (select 1 from public.product_images i where i.product_id = p.id);

-- ───────────────────────────── Variantes ───────────────────────────────────
insert into public.product_variants (product_id, type, label, value, available, stock)
select p.id, v.type, v.label, v.value, v.available, v.stock
from (values
  ('anillo-aurora',        'material', 'Oro blanco 18k',         'oro-blanco',    true, 4),
  ('anillo-aurora',        'material', 'Oro rosa 18k',           'oro-rosa',      true, 2),
  ('anillo-solenne',       'material', 'Plata 925',              'plata',         true, 8),
  ('collar-lumiere',       'material', 'Oro amarillo 18k',       'oro-amarillo',  true, 6),
  ('aretes-gota-de-rocio', 'material', 'Plata 925',              'plata',         true, 6),
  ('pulsera-estio',        'talla',    'Talla única ajustable',  'unica',         true, 20)
) as v(slug, type, label, value, available, stock)
join public.products p on p.slug = v.slug
where not exists (select 1 from public.product_variants pv where pv.product_id = p.id);
