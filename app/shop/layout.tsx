import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "../hero.css";
import "./shop.css";

// Header and footer stay mounted while moving between the shop and product pages. No cookies are
// read here, so every shop page is static and Link prefetches them in full (instant opens);
// the bag badge fills itself in on the client.
export default function ShopLayout({ children }: LayoutProps<"/shop">) {
  return (
    <div className="atelier-root shop-root">
      <SiteHeader current="shop" />
      {children}
      <SiteFooter />
    </div>
  );
}
