import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import HouseSections from "@/components/house/HouseSections";
import "../hero.css";
import "./about.css";

export const metadata: Metadata = {
  title: "About the House | Urban Virtue",
  description:
    "How an Urban Virtue parfum is built: the olfactory architecture, our botanical sourcing, signature editions, craftsmanship and the DC atelier.",
};

const CHAPTERS = [
  { href: "#architecture", label: "Olfactory Architecture" },
  { href: "#cabinet", label: "Botanical Cabinet" },
  { href: "#editions", label: "Signature Editions" },
  { href: "#craftsmanship", label: "Craftsmanship" },
  { href: "#boutique", label: "Visit the Atelier" },
];

export default function AboutPage() {
  return (
    <div className="atelier-root">
      <SiteHeader current="about" />
      <main>
        <header className="wrap about-intro">
          <p className="about-eyebrow">✦ The House of Urban Virtue</p>
          <h1 className="about-title">Middle Eastern oud traditions, poured with French elegance</h1>
          <p className="about-lede">
            Haute parfumerie from Washington, DC. Discover how our notes unfold, where our raw
            materials come from, and the craft behind every flacon.
          </p>
          <nav className="about-chapters" aria-label="On this page">
            {CHAPTERS.map((c) => (
              <a key={c.href} href={c.href}>
                {c.label}
              </a>
            ))}
          </nav>
        </header>
        <HouseSections />
      </main>
      <SiteFooter />
    </div>
  );
}
