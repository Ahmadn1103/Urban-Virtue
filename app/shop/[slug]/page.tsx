import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PendingBar from "@/components/PendingBar";
import ProductCard, { CARD_IMAGE_SIZES } from "@/components/shop/ProductCard";
import ProductPurchase from "@/components/shop/ProductPurchase";
import { getProduct, getProducts, getRelated, toCard } from "@/lib/products";

// Only the products in products.csv exist; any other slug is a 404 without touching the server
export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  const notes = product.notes
    ? [...product.notes.top, ...product.notes.heart, ...product.notes.base]
    : product.profile || [];
  return {
    title: `${product.name} | Urban Virtue`,
    description: product.intro ?? `${product.name}: ${notes.join(", ")}.`,
    openGraph: { images: [product.image] },
  };
}

const TIERS = [
  { key: "top", label: "Top", hint: "First impression" },
  { key: "heart", label: "Heart", hint: "The character" },
  { key: "base", label: "Base", hint: "What lingers" },
] as const;

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const p = product;
  const related = getRelated(p);
  const primary = p.categories[0];

  return (
    <main className="wrap product-page">
      <nav className="product-crumbs" aria-label="Breadcrumb">
        <Link href="/shop#collection">
          <PendingBar />
          Shop
        </Link>
        {primary && (
          <>
            <span aria-hidden="true">/</span>
            <Link href={`/shop?category=${primary.id}#collection`}>
              <PendingBar />
              {primary.label}
            </Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{p.name}</span>
      </nav>

      <article className="product-layout">
        <div className="product-media">
          {/* Same file the shop card already loaded: paints instantly, then the sharp one covers it */}
          <Image className="product-media-low" src={p.image} alt="" fill sizes={CARD_IMAGE_SIZES} />
          <Image src={p.image} alt={p.name} fill preload sizes="(max-width: 900px) 100vw, 600px" />
        </div>

        <div className="product-info">
          <p className="product-house">
            {p.byline}
            {p.imported && p.byline !== "Imported" && " · Imported"}
          </p>
          <h1 className="product-title">{p.name}</h1>
          {p.tagline && <p className="product-tagline">{p.tagline}</p>}

          <ul className="product-cats" aria-label="Collections">
            {p.categories.map((c) => (
              <li key={c.id}>
                <Link href={`/shop?category=${c.id}#collection`}>
                  <PendingBar />
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="product-price-lg">
            {p.priceLabel}
            {p.priceMin !== p.priceMax && <small>Price varies by flacon size</small>}
          </p>

          <ProductPurchase />

          {p.intro && <p className="product-intro">{p.intro}</p>}

          {p.notes && (
            <section className="product-notes" aria-labelledby="pyramid-title">
              <h2 id="pyramid-title">Olfactory Pyramid</h2>
              <dl>
                {TIERS.filter((t) => p.notes![t.key].length).map((t) => (
                  <div key={t.key} className={`pyramid-row tier-${t.key}`}>
                    <dt>
                      {t.label}
                      <small>{t.hint}</small>
                    </dt>
                    <dd>
                      {p.notes![t.key].map((n) => (
                        <span key={n} className="note-chip">
                          {n}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {p.profile && (
            <section className="product-notes" aria-labelledby="profile-title">
              <h2 id="profile-title">Scent Profile</h2>
              <dl>
                <div className="pyramid-row">
                  <dt>Profile</dt>
                  <dd>
                    {p.profile.map((n) => (
                      <span key={n} className="note-chip">
                        {n}
                      </span>
                    ))}
                  </dd>
                </div>
                {p.mood && (
                  <div className="pyramid-row">
                    <dt>Mood</dt>
                    <dd className="product-mood">{p.mood}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          <div className="product-actions">
            <Link className="btn btn-ghost" href="/custom-studio">
              <PendingBar />✦ Compose a Custom Blend
            </Link>
            <Link className="btn btn-ghost" href="/shop#collection">
              <PendingBar />
              Back to the Collection
            </Link>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="product-related" aria-labelledby="related-title">
          <h2 id="related-title">From the Same Family</h2>
          <ul className="shop-grid">
            {related.map((r) => (
              <li key={r.slug}>
                <ProductCard product={toCard(r)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
