import { config } from "./config";

const priceFormatter = new Intl.NumberFormat(config.currency.locale, {
  style: "currency",
  currency: config.currency.code,
  maximumFractionDigits: 0,
});

/** Formatea un precio del catálogo: 890 → "$890". */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}
