"use client"; // the newsletter form handles its own submit

/* eslint-disable @next/next/no-img-element -- emblem image */
import Link from "next/link";
import PendingBar from "./PendingBar";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <div className="brand-logo-wrap">
            <img
              src="/logo.jpeg"
              alt="Urban Virtue Emblem"
              className="brand-logo-img"
              width={50}
              height={50}
            />
          </div>
          <span className="footer-title">Urban Virtue</span>
          <p className="footer-sub">Haute Parfumerie · Washington, DC</p>
          <p className="footer-desc">
            Bespoke fragrance architecture honoring ancient botanical traditions and
            modern sensory sophistication.
          </p>
        </div>

        <div className="footer-col">
          <h4>Bespoke Atelier</h4>
          <ul>
            <li>
              <Link href="/custom-studio"><PendingBar />Custom Blend Studio</Link>
            </li>
            <li>
              <Link href="/about#architecture"><PendingBar />Scent Architecture</Link>
            </li>
            <li>
              <Link href="/about#cabinet"><PendingBar />Botanical Raw Materials</Link>
            </li>
            <li>
              <Link href="/about#craftsmanship"><PendingBar />Flacon Personalization</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Collections</h4>
          <ul>
            <li>
              <Link href="/shop?category=the-liquid-grail"><PendingBar />The Liquid Grail Series</Link>
            </li>
            <li>
              <Link href="/shop?category=body-musk"><PendingBar />Madina Body Musks</Link>
            </li>
            <li>
              <Link href="/shop?category=gourmand-oriental-and-amber-parfum"><PendingBar />Gourmand & Amber Parfums</Link>
            </li>
            <li>
              <Link href="/shop?category=single-notes"><PendingBar />Single Harvest Absolutes</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>The Atelier Newsletter</h4>
          <p>
            Receive private invitations to limited-edition harvest distillations and DC
            parfumerie events.
          </p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" required />
            <button type="submit" aria-label="Subscribe">
              →
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom wrap">
        <p>© 2026 Urban Virtue Parfums. All Rights Reserved. Crafted with noble intentions.</p>
        <div className="footer-legal">
          <a href="#top">Privacy Policy</a>
          <span>·</span>
          <a href="#top">Terms of Service</a>
          <span>·</span>
          <a href="#top">Sustainable Sourcing</a>
        </div>
      </div>
    </footer>
  );
}
