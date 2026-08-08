import type { ReactNode } from "react";
import { CartProvider } from "@/components/commerce/CartContext";
import { CartFab } from "@/components/commerce/CartFab";

export default function CommerceLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartFab />
    </CartProvider>
  );
}
