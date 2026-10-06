import Link from "next/link";
import PendingBar from "@/components/PendingBar";
import { SIZES, formatPrice } from "@/lib/catalog";
import CardPending from "./CardPending";
import StudioFlacon from "./StudioFlacon";

const prices = SIZES.map((z) => z.rawPrice);
const priceLabel = `${formatPrice(Math.min(...prices))} – ${formatPrice(Math.max(...prices))}`;

// First tile of the collection: opens the Custom Studio page
export default function CustomBlendCard() {
  return (
    <Link className="product-card custom-card" href="/custom-studio">
      <span className="product-card-img custom-card-img">
        <StudioFlacon width={240} />
        <span className="product-badge">Bespoke</span>
        <CardPending />
        <PendingBar />
      </span>
      <span className="product-card-body">
        <span className="product-house">Custom Studio</span>
        <span className="product-name">Your Signature Blend</span>
        <span className="product-preview">Pick 2–3 of 9 noble essences · inscribe your label</span>
        <span className="product-price">{priceLabel}</span>
      </span>
    </Link>
  );
}
