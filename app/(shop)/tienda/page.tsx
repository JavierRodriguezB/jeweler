import type { Metadata } from "next";
import TiendaContent from "@/app/components/shop/TiendaContent";

export const metadata: Metadata = {
  title: "Tienda — COCOLU",
  description:
    "Explora todo el catálogo de COCOLU: anillos, collares, aretes y más.",
};

export default function TiendaPage() {
  return <TiendaContent />;
}
