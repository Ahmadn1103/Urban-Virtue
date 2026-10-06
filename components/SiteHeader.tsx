/* eslint-disable @next/next/no-img-element -- small emblem */
// Every link is a client-side <Link>: pages are prefetched, so most open instantly; a PendingBar
// shows along the top of the window for any that still have to load.
import Link from "next/link";
import BagBadge from "./BagBadge";
import PendingBar from "./PendingBar";

type Page = "studio" | "shop" | "about" | "bag";

const PAGES: { href: string; label: string; page: Page }[] = [
  { href: "/shop", label: "Shop", page: "shop" },
  { href: "/custom-studio", label: "Custom Studio", page: "studio" },
  { href: "/about", label: "About", page: "about" },
];

type Props = {
  current: Page;
};

export default function SiteHeader({ current }: Props) {
  return (
    <header className="site-header">
      <div className="wrap header-content">
        <Link className="brand" href="/shop" aria-label="Urban Virtue: Shop">
          <PendingBar />
          <div className="brand-logo-wrap">
            <img
              src="/logo.jpeg"
              alt="Urban Virtue Emblem"
              className="brand-logo-img"
              width={32}
              height={32}
            />
          </div>
          <div className="brand-text">
            <span className="brand-title">Urban Virtue</span>
            <small className="brand-sub">Haute Parfumerie · Washington, DC</small>
          </div>
        </Link>

        <nav className="site-nav" aria-label="Primary Navigation">
          {PAGES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={"nav-link" + (item.page === current ? " is-active" : "")}
              aria-current={item.page === current ? "page" : undefined}
            >
              <PendingBar />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {/* Bag Button: the count is shared across pages (BagBadge) */}
          <Link
            className={"bag-btn" + (current === "bag" ? " is-active" : "")}
            href="/bag"
            aria-label="Atelier Bag"
            aria-current={current === "bag" ? "page" : undefined}
          >
            <PendingBar />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5.5 8h13l-1 12h-11z" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            </svg>
            <BagBadge />
          </Link>
        </div>
      </div>
    </header>
  );
}
