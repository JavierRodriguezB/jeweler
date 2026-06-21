/**
 * Persistencia de pedidos en localStorage (maqueta, sin backend).
 * Solo debe usarse desde componentes cliente. Cuando exista API/DB, estas
 * funciones se reemplazan por llamadas reales.
 */

import type { Order } from "../../lib/types";
import { mockOrders } from "../../lib/mock-data";

const ORDERS_KEY = "cocolu-orders";

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Order): void {
  try {
    const all = getStoredOrders();
    all.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Pedidos de un usuario: los sembrados en el mock + los creados en esta sesión. */
export function getOrdersForUser(userId: string): Order[] {
  const stored = getStoredOrders().filter((o) => o.userId === userId);
  const seeded = mockOrders.filter((o) => o.userId === userId);
  return [...stored, ...seeded].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}
