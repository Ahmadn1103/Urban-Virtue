import type { Metadata } from "next";
import { Suspense } from "react";
import CustomBlend from "@/components/hero/CustomBlend";
import ShopBrowser, { ShopBrowserFromUrl } from "@/components/shop/ShopBrowser";
import { getCategories, getProducts, toCard } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop | Urban Virtue",
  description:
    "Compose a custom Urban Virtue parfum in the 3D studio, or browse our parfums, body musks and imported single-note oils.",
};

// Static: the studio boots on the client behind its skeletons, and the collection's URL filters
// (?category=…&q=…&sort=…) are applied on the client
export default function ShopPage() {
  const products = getProducts().map(toCard);
  const categories = getCategories();

  return (
    <main>
      {/* The 3D blend studio opens the shop, so patrons can start composing straight away */}
      <CustomBlend variant="shop" />

      <section id="collection" className="wrap shop-page shop-collection" aria-labelledby="collection-title">
        <header className="shop-head">
          <p className="shop-eyebrow">✦ The Collection</p>
          <h2 id="collection-title" className="shop-title">
            Shop the Parfumerie
          </h2>
          <p className="shop-sub">
            Signature parfums, body musks and imported single-note oils from the Urban Virtue atelier.
          </p>
        </header>

        {/* Prerendered unfiltered; the URL-aware browser takes over on the client */}
        <Suspense fallback={<ShopBrowser products={products} categories={categories} />}>
          <ShopBrowserFromUrl products={products} categories={categories} />
        </Suspense>
      </section>
    </main>
  );
}
