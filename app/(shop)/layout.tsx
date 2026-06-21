import ShopHeader from "../components/shop/ShopHeader";
import ShopFooter from "../components/shop/ShopFooter";
import CartDrawer from "../components/cart/CartDrawer";

/** Layout del escaparate: cabecera + contenido + pie, sobre el layout raíz. */
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <main className="flex-1">{children}</main>
      <ShopFooter />
      <CartDrawer />
    </div>
  );
}
