// Shown while the shop streams in on a client-side navigation
export default function ShopLoading() {
  return (
    <main className="wrap shop-page" aria-busy="true" aria-label="Loading the shop">
      <div className="shop-head">
        <span className="skel-line skel-shimmer" style={{ width: 140 }} />
        <span className="skel-heading skel-shimmer" />
        <span className="skel-line skel-shimmer" style={{ width: "min(520px, 90%)" }} />
      </div>
      <ul className="shop-grid" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="product-card is-skeleton">
            <span className="product-card-img skel-shimmer" />
            <span className="product-card-body">
              <span className="skel-line skel-line-short skel-shimmer" />
              <span className="skel-line skel-shimmer" />
              <span className="skel-line skel-line-short skel-shimmer" />
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
