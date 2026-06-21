-- ============================================================================
-- COCOLU · Esquema inicial (Fase 6 — backend Supabase)
-- Ejecutar en el SQL Editor del dashboard o con `supabase db push`.
-- ============================================================================

-- ───────────────────────────── Tablas ──────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '',
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text not null default '',
  accent       text,
  sort_order   int not null default 99,
  featured     boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  description       text not null default '',
  price             numeric(10, 2) not null default 0,
  compare_at_price  numeric(10, 2),
  category_id       uuid references public.categories (id) on delete restrict,
  season            text not null default 'atemporal'
                      check (season in ('primavera','verano','otono','invierno','atemporal')),
  status            text not null default 'active'
                      check (status in ('active','draft','archived')),
  stock             int not null default 0,
  sku               text,
  rating            numeric(2, 1) not null default 0,
  review_count      int not null default 0,
  is_new            boolean not null default false,
  is_on_sale        boolean not null default false,
  details           jsonb not null default '[]'::jsonb,
  tags              text[] not null default '{}',
  created_at        timestamptz not null default now()
);

create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  url         text not null,
  alt         text not null default '',
  is_primary  boolean not null default false,
  position    int not null default 0
);

create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  type        text not null check (type in ('color','material','talla')),
  label       text not null,
  value       text not null,
  available   boolean not null default true,
  stock       int not null default 0
);

create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete set null,
  guest_email text,
  status      text not null default 'pending'
                check (status in ('pending','paid','shipped','delivered','cancelled')),
  subtotal    numeric(10, 2) not null default 0,
  total       numeric(10, 2) not null default 0,
  created_at  timestamptz not null default now(),
  -- Debe tener dueño registrado o correo de invitado.
  constraint orders_owner_check check (user_id is not null or guest_email is not null)
);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid,
  name          text not null,
  variant_label text,
  unit_price    numeric(10, 2) not null,
  quantity      int not null check (quantity > 0)
);

create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_product_images_product on public.product_images (product_id);
create index if not exists idx_product_variants_product on public.product_variants (product_id);
create index if not exists idx_orders_user on public.orders (user_id);
create index if not exists idx_order_items_order on public.order_items (order_id);

-- ──────────────────────── Roles: helper + trigger ──────────────────────────

-- ¿El usuario actual es admin? `security definer` para poder leer profiles
-- sin que las propias políticas de profiles bloqueen la consulta.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Crea el profile automáticamente al registrarse un usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'customer'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────── RLS ───────────────────────────────────────

alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_images   enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;

-- profiles: cada quien el suyo; admin ve todos.
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());

-- categories: lectura pública; escritura solo admin.
create policy "categories_read" on public.categories
  for select using (true);
create policy "categories_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- products: público ve activos; admin ve todo; escritura solo admin.
create policy "products_read" on public.products
  for select using (status = 'active' or public.is_admin());
create policy "products_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- imágenes y variantes: lectura pública; escritura solo admin.
create policy "product_images_read" on public.product_images
  for select using (true);
create policy "product_images_write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

create policy "product_variants_read" on public.product_variants
  for select using (true);
create policy "product_variants_write" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: el dueño o el admin. (El checkout de invitado se inserta con la
-- service role desde el servidor, que omite RLS.)
create policy "orders_select" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy "orders_insert_self" on public.orders
  for insert with check (user_id = auth.uid());

create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items_insert" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
