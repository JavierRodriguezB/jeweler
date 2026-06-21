-- ============================================================================
-- COCOLU · Pedidos: checkout de invitado + referencia de pago
-- ============================================================================

-- Referencia del pago (Mercado Pago) cuando exista.
alter table public.orders add column if not exists payment_id text;

-- Permitir crear pedidos de invitado (sin sesión) desde el cliente.
-- (Los pedidos de usuarios registrados ya están cubiertos por orders_insert_self.)
create policy "orders_insert_guest" on public.orders
  for insert to anon
  with check (user_id is null and guest_email is not null);

create policy "order_items_insert_guest" on public.order_items
  for insert to anon
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id is null
        and o.guest_email is not null
    )
  );
