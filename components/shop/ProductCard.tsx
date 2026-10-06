import Image from "next/image";
import Link from "next/link";
import PendingBar from "@/components/PendingBar";
import CardPending from "./CardPending";
import type { CardProduct } from "@/lib/products";

// Must match the product page's placeholder layer, so the browser reuses the cached file
export const CARD_IMAGE_SIZES = "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 320px";

// Rendered by both the client-side browser and server pages
export default function ProductCard({ product, eager = false }: { product: CardProduct; eager?: boolean }) {
  const p = product;
  return (
    <Link className="product-card" href={`/shop/${p.slug}`}>
      <span className="product-card-img">
        <Image src={p.image} alt={p.name} fill sizes={CARD_IMAGE_SIZES} loading={eager ? "eager" : "lazy"} />
        {p.imported && <span className="product-badge">Imported</span>}
        <CardPending />
        <PendingBar />
      </span>
      <span className="product-card-body">
        <span className="product-house">{p.byline}</span>
        <span className="product-name">{p.name}</span>
        {p.preview.length > 0 && <span className="product-preview">{p.preview.join(" · ")}</span>}
        <span className="product-price">{p.priceLabel}</span>
      </span>
    </Link>
  );
}
