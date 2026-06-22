import type { Metadata } from "next";
import TiendaContent from "@/app/components/shop/TiendaContent";
import { config } from "@/app/lib/config";

export const metadata: Metadata = {
  title: `Tienda — ${config.site.name}`,
  description: `Explora todo el catálogo de ${config.site.name}: anillos, collares, aretes y más.`,
};

export default function TiendaPage() {
  return <TiendaContent />;
}
