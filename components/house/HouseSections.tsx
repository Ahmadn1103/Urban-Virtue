/* eslint-disable @next/next/no-img-element -- editorial photography */
import Link from "next/link";
import PendingBar from "@/components/PendingBar";
import ArchitectureSection from "./ArchitectureSection";

// The About page: how notes unfold, sourcing, signature editions, craftsmanship and the DC atelier.
// Moved from the home page so the 3D blend studio lives only where patrons compose.
// Server-rendered: only ArchitectureSection (tabs) ships JavaScript.
export default function HouseSections() {
  return (
    <>
      <ArchitectureSection />

      {/* ============================================================== */}
      {/* SECTION 3: THE BOTANICAL CABINET (RARE IMPORTED HARVESTS)      */}
      {/* ============================================================== */}
      <section className="cabinet-section" id="cabinet">
        <div className="wrap">
          <div className="section-header">
            <div className="header-left">
              <p className="eyebrow-accent">RAW MATERIAL ARCHIVES</p>
              <h2>The Botanical Cabinet</h2>
            </div>
            <p className="section-desc">
              We travel from the mountain terraces of Taif to the ancient
              forests of Southeast Asia, ethically sourcing pure single harvests
              of the world&apos;s most coveted aromatic botanicals.
            </p>
          </div>

          <div className="cabinet-grid">
            {/* Material 1: Taifi Rose */}
            <div className="cabinet-card">
              <div className="card-media">
                <img
                  src="/images/30_taifi-rose-imported.png"
                  alt="Taifi Rose Petals"
                  loading="lazy"
                />
                <span className="provenance-tag">Taif, Saudi Arabia</span>
              </div>
              <div className="card-body">
                <small className="card-cat">Noble Harvest Absolute</small>
                <h3>Taifi Rose</h3>
                <p>
                  Hand-harvested at dawn before the desert sun evaporates
                  precious petals. Crisp, sparkling floral with royal honey and
                  citrus nuances.
                </p>
                <div className="card-footer">
                  <span>Distillation: Copper Alembic</span>
                  <b>Rare Reserve</b>
                </div>
              </div>
            </div>

            {/* Material 2: Sudanese Sandalwood */}
            <div className="cabinet-card">
              <div className="card-media">
                <img
                  src="/images/36_sandalwood-imported.png"
                  alt="Sudanese Sandalwood"
                  loading="lazy"
                />
                <span className="provenance-tag">Khartoum, Sudan</span>
              </div>
              <div className="card-body">
                <small className="card-cat">Sacred Wood Resin</small>
                <h3>Sudanese Sandalwood</h3>
                <p>
                  Aged heartwood aged over a decade. Yields a creamy, buttery
                  warmth revered in traditional bridal smoke ceremonies and
                  meditation oils.
                </p>
                <div className="card-footer">
                  <span>Aging: 12-Year Matured</span>
                  <b>Sacred Grade</b>
                </div>
              </div>
            </div>

            {/* Material 3: Sudan&apos;s Frankincense */}
            <div className="cabinet-card">
              <div className="card-media">
                <img
                  src="/images/38_sudan-s-frankincense-imported.png"
                  alt="Sudan's Frankincense"
                  loading="lazy"
                />
                <span className="provenance-tag">Red Sea Coast</span>
              </div>
              <div className="card-body">
                <small className="card-cat">Ancient Balsamic Tears</small>
                <h3>Sudan&apos;s Frankincense</h3>
                <p>
                  Green-gold tears of sacred Boswellia resin. Opens with bright
                  lime peel and unfolds into meditative balsamic smoke and sweet
                  woods.
                </p>
                <div className="card-footer">
                  <span>Tears Grade: Green Royal Hojari</span>
                  <b>Ceremonial</b>
                </div>
              </div>
            </div>

            {/* Material 4: French Jasmine */}
            <div className="cabinet-card">
              <div className="card-media">
                <img
                  src="/images/29_french-jasmine-imported.png"
                  alt="French Jasmine"
                  loading="lazy"
                />
                <span className="provenance-tag">Grasse, France</span>
              </div>
              <div className="card-body">
                <small className="card-cat">Grandiflorum Absolute</small>
                <h3>French Jasmine</h3>
                <p>
                  Moonlit jasmine blossoms picked by hand. Intoxicating, velvety
                  sweetness wrapped in honeyed, creamy undertones of eternal
                  French luxury.
                </p>
                <div className="card-footer">
                  <span>Extraction: Enfleurage & CO2</span>
                  <b>Grasse Terroir</b>
                </div>
              </div>
            </div>

            {/* Material 5: White Saffron */}
            <div className="cabinet-card">
              <div className="card-media">
                <img
                  src="/images/37_white-saffron-imported.png"
                  alt="White Saffron"
                  loading="lazy"
                />
                <span className="provenance-tag">Khorasan Terraces</span>
              </div>
              <div className="card-body">
                <small className="card-cat">Golden Stigma Distillate</small>
                <h3>White Saffron</h3>
                <p>
                  Luminous, rare golden threads that yield an airy spicy-leather
                  warmth. Brings quiet power and radiant nobility to bespoke
                  formulas.
                </p>
                <div className="card-footer">
                  <span>Yield: 75,000 Flowers/Kg</span>
                  <b>Ultra Rare</b>
                </div>
              </div>
            </div>

            {/* Material 6: Hand-Finished Leather */}
            <div className="cabinet-card">
              <div className="card-media">
                <img
                  src="/images/32_leather-imported.png"
                  alt="Imported Leather Note"
                  loading="lazy"
                />
                <span className="provenance-tag">Tuscan Tannery</span>
              </div>
              <div className="card-body">
                <small className="card-cat">Suede & Smoke Accord</small>
                <h3>Cuir Artisanal</h3>
                <p>
                  Smoky suede, dried birch bark, and subtle spice notes that
                  evoke bespoke equestrian leather goods and vintage private
                  libraries.
                </p>
                <div className="card-footer">
                  <span>Profile: Smokewood Suede</span>
                  <b>Bold Distinction</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: MASTER EDITIONS (READY-TO-WEAR PARFUMS)             */}
      {/* ============================================================== */}
      <section className="editions-section" id="editions">
        <div className="wrap">
          <div className="section-header text-center">
            <p className="eyebrow-accent">CURATED MASTERPIECES</p>
            <h2>The Urban Virtue Editions</h2>
            <p className="section-desc">
              In addition to our custom studio, explore our permanent collection
              of legendary extrait formulations cherished by collectors across
              the globe.
            </p>
          </div>

          <div className="editions-grid">
            {/* Product 1: AHOUD BEDAZZLED */}
            <div className="edition-card">
              <div className="edition-img-wrap">
                <img
                  src="/images/01_ahoud-bedazzled-by-urban-virtue.jpeg"
                  alt="Ahoud Bedazzled Perfume"
                  loading="lazy"
                />
                <span className="edition-badge">Fall Collection 🍁</span>
              </div>
              <div className="edition-details">
                <small>Gourmand, Oriental & Amber</small>
                <h3>AHOUD (BEDAZZLED)</h3>
                <p className="edition-notes">
                  Orange Blossoms · French Jasmine · Bourbon Vanilla · White
                  Musk · Sudanese Sandal
                </p>
                <div className="edition-price-row">
                  <span className="ed-price">$79.99</span>
                  <Link href="/custom-studio" className="ed-btn">
                    <PendingBar />
                    Craft Similar
                  </Link>
                </div>
              </div>
            </div>

            {/* Product 2: ARAQ AL NABI */}
            <div className="edition-card">
              <div className="edition-img-wrap">
                <img
                  src="/images/11_araq-al-nabi-by-urban-virtue.jpeg"
                  alt="Araq Al Nabi Signature Musk"
                  loading="lazy"
                />
                <span className="edition-badge gold-badge">
                  Atelier Signature
                </span>
              </div>
              <div className="edition-details">
                <small>The Liquid Grail · Body Musk</small>
                <h3>ARAQ AL NABI</h3>
                <p className="edition-notes">
                  Fresh Green Leaves · Madina Lotus · Wild Honey · Powdery
                  Tahara Musk · Sandalwood
                </p>
                <div className="edition-price-row">
                  <span className="ed-price">$139.99</span>
                  <Link href="/custom-studio" className="ed-btn">
                    <PendingBar />
                    Craft Similar
                  </Link>
                </div>
              </div>
            </div>

            {/* Product 3: ORCHID OUD */}
            <div className="edition-card">
              <div className="edition-img-wrap">
                <img
                  src="/images/09_orchid-oud-by-urban-virtue.jpeg"
                  alt="Orchid Oud Parfum"
                  loading="lazy"
                />
                <span className="edition-badge">Rare Reserve</span>
              </div>
              <div className="edition-details">
                <small>Oriental Floral Extrait</small>
                <h3>ORCHID OUD</h3>
                <p className="edition-notes">
                  Calabrian Bergamot · White Saffron · Night Orchid · Aged
                  Cambodian Oud · Amber
                </p>
                <div className="edition-price-row">
                  <span className="ed-price">$99.99</span>
                  <Link href="/custom-studio" className="ed-btn">
                    <PendingBar />
                    Craft Similar
                  </Link>
                </div>
              </div>
            </div>

            {/* Product 4: LAVENDER LEATHER */}
            <div className="edition-card">
              <div className="edition-img-wrap">
                <img
                  src="/images/04_lavender-leather-by-urban-virtue.jpeg"
                  alt="Lavender Leather"
                  loading="lazy"
                />
                <span className="edition-badge">Earthy & Woody</span>
              </div>
              <div className="edition-details">
                <small>Aromatic Leather Extrait</small>
                <h3>LAVENDER LEATHER</h3>
                <p className="edition-notes">
                  Provence Lavender · Sicilian Lemon · Saffron Threads · Tuscan
                  Suede · Oud Chips
                </p>
                <div className="edition-price-row">
                  <span className="ed-price">$79.99</span>
                  <Link href="/custom-studio" className="ed-btn">
                    <PendingBar />
                    Craft Similar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 5: THE BESPOKE UNBOXING CRAFTSMANSHIP                  */}
      {/* ============================================================== */}
      <section className="craftsmanship-section" id="craftsmanship">
        <div className="wrap">
          <div className="craft-grid">
            <div className="craft-content">
              <p className="eyebrow-accent">THE ATELIER STANDARD</p>
              <h2>An Unboxing Ritual Fit for Royalty</h2>
              <p className="craft-desc">
                Every custom flacon blended in our Washington DC laboratory
                arrives as an archival heirloom. We honor the centuries-old
                French tradition of haute parfumerie with personalized
                packaging.
              </p>

              <div className="craft-steps">
                <div className="craft-step">
                  <span className="craft-num">01</span>
                  <div>
                    <h4>Heavyweight Crystal Flacon</h4>
                    <p>
                      Mouth-blown optical glass flacon designed with calibrated
                      light refraction and a weighted magnetic brass closure.
                    </p>
                  </div>
                </div>
                <div className="craft-step">
                  <span className="craft-num">02</span>
                  <div>
                    <h4>Personalized Gold Foil Stamping</h4>
                    <p>
                      Your blend name and unique batch formula number
                      hot-stamped in gilded foil, accented with our royal
                      emblem.
                    </p>
                  </div>
                </div>
                <div className="craft-step">
                  <span className="craft-num">03</span>
                  <div>
                    <h4>Hand-Waxed Atelier Seal</h4>
                    <p>
                      Sealed by our master perfumer with metallic navy wax,
                      guaranteeing zero oxygen exposure until your inaugural
                      spray.
                    </p>
                  </div>
                </div>
                <div className="craft-step">
                  <span className="craft-num">04</span>
                  <div>
                    <h4>Italian Suede Coffret & Sampler</h4>
                    <p>
                      Nestled within an embossed Italian suede travel pouch,
                      accompanied by an archival formula card and 5ml travel
                      vial.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="craft-visual">
              <div className="visual-emblem-card">
                <img
                  src="/logo.jpeg"
                  alt="Urban Virtue Official Seal"
                  className="craft-emblem-large"
                />
                <div className="emblem-card-overlay">
                  <span className="seal-tag">THE SEAL OF AUTHENTICITY</span>
                  <h3>Handcrafted in Washington, DC</h3>
                  <p>
                    Bottled at 28% Extrait de Parfum concentration for peerless
                    14-hour longevity and magnetic projection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 6: FLAGSHIP BOUTIQUE & APPOINTMENTS                    */}
      {/* ============================================================== */}
      <section className="boutique-section" id="boutique">
        <div className="wrap">
          <div className="boutique-card">
            <div className="boutique-info">
              <p className="eyebrow-accent">PRIVATE ATELIER VISIT</p>
              <h2>Experience the Scent Bar in Person</h2>
              <p>
                Immerse your senses in over 60 rare botanical extracts at our
                flagship DC showroom. Work 1-on-1 with our Master Perfumer to
                formulate an exclusive signature scent during a private
                champagne consultation.
              </p>
              <div className="boutique-hours">
                <div>
                  <b>Flagship Location:</b>
                  <span>14th Street Corridor · Washington, DC</span>
                </div>
                <div>
                  <b>Private Atelier Hours:</b>
                  <span>Tuesday – Sunday · 11:00 AM – 7:00 PM</span>
                </div>
              </div>
              <div className="boutique-actions">
                <Link
                  href="/custom-studio"
                  className="btn btn-primary btn-gold"
                >
                  <PendingBar />
                  <span className="btn-shine" />
                  <span className="btn-text">
                    ✦ Reserve Private Consultation
                  </span>
                </Link>
                <Link href="/custom-studio" className="btn btn-ghost">
                  <PendingBar />
                  Order Custom Online
                </Link>
              </div>
            </div>
            <div className="boutique-quote">
              <div className="quote-box">
                <span className="quote-mark">“</span>
                <p>
                  Urban Virtue redefines modern niche perfumery: combining raw
                  Middle Eastern oud treasures with timeless French elegance.
                </p>
                <small>— Le Monde des Parfums Review</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
