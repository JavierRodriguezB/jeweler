import { CURRENCY } from "./types";

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

/** Formatea un precio del catálogo: 890 → "$890". */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}
