"use client";

import { useState } from "react";
import { VariantPicker, StockBadge, type ProductItem } from "@/components/commerce/StoreFront";
import { useCart } from "@/components/commerce/CartContext";

export function ProductDetailClient({ product }: { product: ProductItem }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div>
      <div className="mb-3"><StockBadge stock={product.stock} /></div>
      {added ? (
        <p className="card p-4 text-center font-display font-semibold text-green-600">✓ Added — keep shopping or checkout from the cart.</p>
      ) : (
        <VariantPicker
          product={product}
          onPicked={(variant) => {
            add({ slug: product.slug, name: product.name, priceNGN: product.priceNGN, variant });
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);
          }}
        />
      )}
    </div>
  );
}
