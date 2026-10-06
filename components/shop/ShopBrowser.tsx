"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CustomBlendCard from "./CustomBlendCard";
import ProductCard from "./ProductCard";
import type { CardProduct, Category } from "@/lib/products";
import { DEFAULT_QUERY, SORTS, parseShopQuery, shopQueryString, type ShopQuery, type SortKey } from "./shopQuery";

type Props = {
  products: CardProduct[];
  categories: Category[];
  initial?: ShopQuery;
  syncUrl?: boolean; // only the URL-driven instance writes the filters back to the address bar
};

// Reads the filters from the URL. The shop page is static, so this renders on the client inside
// <Suspense>, with the unfiltered <ShopBrowser> as its prerendered fallback.
export function ShopBrowserFromUrl(props: Omit<Props, "initial">) {
  const search = useSearchParams().toString();
  const ids = props.categories.map((c) => c.id);
  // Read once on mount: later URL changes come from this component's own replaceState
  const [initial] = useState(() => parseShopQuery(search, ids));
  return <ShopBrowser {...props} initial={initial} syncUrl />;
}

export default function ShopBrowser({ products, categories, initial = DEFAULT_QUERY, syncUrl = false }: Props) {
  const [category, setCategory] = useState(initial.category);
  const [q, setQ] = useState(initial.q);
  const [sort, setSort] = useState<SortKey>(initial.sort);

  const shown = useMemo(() => {
    // Each term must start a word, so "oud" finds Black Oud but not Ahoud
    const terms = q
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => new RegExp("(^|[^a-z0-9])" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    const list = products.filter(
      (p) =>
        (!category || p.categories.some((c) => c.id === category)) &&
        terms.every((t) => t.test(p.searchText)),
    );
    const by: Record<SortKey, (a: CardProduct, b: CardProduct) => number> = {
      featured: (a, b) => a.order - b.order,
      "price-asc": (a, b) => a.priceMin - b.priceMin || a.order - b.order,
      "price-desc": (a, b) => b.priceMax - a.priceMax || a.order - b.order,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return list.sort(by[sort]);
  }, [products, category, q, sort]);

  // Keep the URL shareable without a navigation (Next syncs replaceState with its router)
  useEffect(() => {
    if (!syncUrl) return;
    const qs = shopQueryString({ category, q, sort });
    const next = "/shop" + (qs ? "?" + qs : "");
    if (next !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", next);
    }
  }, [category, q, sort, syncUrl]);

  // The custom studio leads the unfiltered collection, and answers searches for it
  const showCustom = !category && (!q.trim() || /\b(custom|bespoke|blend|studio)/i.test(q));

  const active = categories.find((c) => c.id === category);
  const clear = () => {
    setCategory("");
    setQ("");
  };

  return (
    <>
      <div className="shop-controls">
        <div className="shop-chips" role="group" aria-label="Filter by collection">
          <button type="button" className="shop-chip" aria-pressed={!category} onClick={() => setCategory("")}>
            All <small>{products.length}</small>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="shop-chip"
              aria-pressed={category === c.id}
              onClick={() => setCategory(category === c.id ? "" : c.id)}
            >
              {c.label} <small>{c.count}</small>
            </button>
          ))}
        </div>

        <div className="shop-tools">
          <label className="shop-search">
            <span className="sr-only">Search the collection</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              type="search"
              placeholder="Search by name or note: oud, rose, vanilla…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <label className="shop-sort">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="shop-count" aria-live="polite">
        {shown.length === products.length
          ? `${products.length} fragrances`
          : `${shown.length} of ${products.length} fragrances`}
        {active && <> in {active.label}</>}
        {q.trim() && <> matching “{q.trim()}”</>}
      </p>

      {shown.length || showCustom ? (
        <ul className="shop-grid">
          {showCustom && (
            <li>
              <CustomBlendCard />
            </li>
          )}
          {shown.map((p, i) => (
            <li key={p.slug}>
              <ProductCard product={p} eager={i < 8} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="shop-empty">
          <h2>Nothing matches yet</h2>
          <p>Try another note or collection, or compose a blend of your own in the studio.</p>
          <button type="button" className="btn btn-ghost" onClick={clear}>
            Clear Filters
          </button>
        </div>
      )}
    </>
  );
}
