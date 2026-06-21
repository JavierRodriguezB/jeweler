import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";

/**
 * Webhook de Mercado Pago: cuando un pago se aprueba, marca el pedido como
 * pagado (usa la service role para omitir RLS). Inactivo hasta tener
 * `MP_ACCESS_TOKEN` + `SUPABASE_SECRET_KEY`.
 *
 * NOTA: sin probar en vivo. Conviene además validar la firma del webhook de MP
 * antes de producción.
 */
export async function POST(request: Request) {
  const token = process.env.MP_ACCESS_TOKEN;
  const admin = createAdminClient();
  if (!token || !admin) return new NextResponse(null, { status: 200 });

  try {
    const body = (await request.json().catch(() => ({}))) as {
      type?: string;
      data?: { id?: string };
    };
    const paymentId = body?.data?.id;
    if (!paymentId) return new NextResponse(null, { status: 200 });

    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const payment = (await res.json()) as {
      status?: string;
      external_reference?: string;
    };

    if (payment.status === "approved" && payment.external_reference) {
      await admin
        .from("orders")
        .update({ status: "paid", payment_id: String(paymentId) })
        .eq("id", payment.external_reference);
    }

    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 200 });
  }
}
