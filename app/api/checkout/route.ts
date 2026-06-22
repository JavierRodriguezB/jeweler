import { NextResponse } from "next/server";
import { config } from "@/app/lib/config";

/**
 * Crea una preferencia de pago en Mercado Pago y devuelve la URL de checkout.
 * Si no hay `MP_ACCESS_TOKEN`, responde `{ simulated: true }` y el front sigue
 * con el flujo de pago simulado.
 *
 * Moneda y rutas de retorno salen de `lib/config` (centralizado).
 */
type CheckoutItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export async function POST(request: Request) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ simulated: true });

  const { orderId, items, payerEmail } = (await request.json()) as {
    orderId: string;
    items: CheckoutItem[];
    payerEmail?: string;
  };
  const origin = new URL(request.url).origin;

  const preference = {
    items: items.map((it) => ({
      title: it.name,
      quantity: it.quantity,
      unit_price: Number(it.unitPrice),
      currency_id: config.currency.code,
    })),
    external_reference: orderId,
    payer: payerEmail ? { email: payerEmail } : undefined,
    back_urls: {
      success: `${origin}${config.payments.returnPaths.success}`,
      pending: `${origin}${config.payments.returnPaths.pending}`,
      failure: `${origin}${config.payments.returnPaths.failure}`,
    },
    auto_return: "approved",
    notification_url: `${origin}/api/payments/webhook`,
  };

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preference),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "mp_error" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ url: data.init_point ?? data.sandbox_init_point });
}
