import SiteHeader from "@/components/SiteHeader";
import "../hero.css";
import "./bag.css";

// Shown instantly while the bag (read from its cookie on the server) loads
export default function BagLoading() {
  return (
    <div className="atelier-root bag-root" aria-busy="true">
      <SiteHeader current="bag" />
      <main className="wrap bag-page">
        <header className="bag-head">
          <span className="skel-line skel-shimmer" style={{ display: "block", width: 120 }} />
          <span className="skel-heading skel-shimmer" style={{ display: "block", margin: "14px 0" }} />
          <span className="skel-line skel-shimmer" style={{ display: "block", width: 320 }} />
        </header>
        <div className="bag-layout" aria-hidden="true">
          <ol className="bag-list">
            {[0, 1].map((i) => (
              <li key={i} className="bag-item">
                <div className="bag-flacon">
                  <div className="flacon-skeleton">
                    <span className="flacon-skeleton-cap" />
                    <span className="flacon-skeleton-body" />
                  </div>
                </div>
                <div className="bag-item-body" style={{ display: "grid", gap: 12, alignContent: "center" }}>
                  <span className="skel-line skel-line-short skel-shimmer" style={{ display: "block" }} />
                  <span className="skel-line skel-shimmer" style={{ display: "block", height: 22 }} />
                  <span className="skel-line skel-shimmer" style={{ display: "block" }} />
                </div>
              </li>
            ))}
          </ol>
          <aside className="bag-summary">
            <span className="skel-block skel-shimmer" />
            <span className="skel-block skel-shimmer" />
          </aside>
        </div>
      </main>
    </div>
  );
}
