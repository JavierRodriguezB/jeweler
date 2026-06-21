import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import { CartProvider } from "./components/cart/CartContext";
import { AuthProvider } from "./components/auth/AuthContext";
import { CatalogProvider } from "./components/catalog/CatalogContext";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COCOLU — Joyería de Alta Manufactura",
  description: "Piezas únicas, talladas a mano. Una experiencia de joyería premium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-ink">
        <SmoothScroll>
          <CatalogProvider>
            <AuthProvider>
              <CartProvider>{children}</CartProvider>
            </AuthProvider>
          </CatalogProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
