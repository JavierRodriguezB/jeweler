import { createClient } from "./client";
import type { Order, OrderStatus } from "../types";

export type NewOrderInput = {
  userId?: string | null;
  guestEmail?: string | null;
  status: OrderStatus;
  subtotal: number;
  total: number;
  items: {
    productId: string;
    name: string;
    variantLabel?: string;
    unitPrice: number;
    quantity: number;
  }[];
};

type CreateResult = { ok: true; id: string } | { ok: false; error: string };

/** Crea un pedido y sus líneas en Supabase. */
export async function createOrder(input: NewOrderInput): Promise<CreateResult> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId ?? null,
      guest_email: input.guestEmail ?? null,
      status: input.status,
      subtotal: input.subtotal,
      total: input.total,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "No se pudo crear el pedido." };
  }

  const orderId = (data as { id: string }).id;

  if (input.items.length > 0) {
    const { error: itemsError } = await supabase.from("order_items").insert(
      input.items.map((it) => ({
        order_id: orderId,
        product_id: it.productId,
        name: it.name,
        variant_label: it.variantLabel ?? null,
        unit_price: it.unitPrice,
        quantity: it.quantity,
      }))
    );
    if (itemsError) return { ok: false, error: itemsError.message };
  }

  return { ok: true, id: orderId };
}

type DbOrderItem = {
  product_id: string | null;
  name: string;
  variant_label: string | null;
  unit_price: number | string;
  quantity: number;
};

type DbOrder = {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  subtotal: number | string;
  total: number | string;
  created_at: string;
  order_items: DbOrderItem[] | null;
};

function mapOrder(row: DbOrder): Order {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    guestEmail: row.guest_email ?? undefined,
    status: row.status,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    createdAt: row.created_at,
    lines: (row.order_items ?? []).map((it) => ({
      productId: it.product_id ?? "",
      name: it.name,
      variantLabel: it.variant_label ?? undefined,
      unitPrice: Number(it.unit_price),
      quantity: it.quantity,
    })),
  };
}

/** Pedidos de un usuario (historial). */
export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as DbOrder[]).map(mapOrder);
}

/** Total de pedidos (para el dashboard; el admin los ve todos por RLS). */
export async function countOrders(): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}
