// Shown while a product page streams in
export default function ProductLoading() {
  return (
    <main className="wrap product-page" aria-busy="true" aria-label="Loading fragrance">
      <span className="skel-line skel-shimmer" style={{ width: 220 }} />
      <div className="product-layout" aria-hidden="true">
        <div className="product-media skel-shimmer" />
        <div className="product-info">
          <span className="skel-line skel-line-short skel-shimmer" />
          <span className="skel-heading skel-shimmer" />
          <span className="skel-line skel-shimmer" style={{ width: "40%" }} />
          {[0, 1, 2].map((i) => (
            <span key={i} className="skel-block skel-shimmer" />
          ))}
        </div>
      </div>
    </main>
  );
}
