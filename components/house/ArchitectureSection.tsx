"use client";

/* eslint-disable @next/next/no-img-element -- editorial photography */
import { useState } from "react";

// The only interactive part of the About page (top / heart / base tabs), so it alone hydrates
export default function ArchitectureSection() {
  const [activeTierTab, setActiveTierTab] = useState<"top" | "heart" | "base">(
    "heart",
  );

  return (
    <>
      {/* ============================================================== */}
      {/* SECTION 2: SCENT ARCHITECTURE (TOP, HEART, BASE TIERS)         */}
      {/* ============================================================== */}
      <section className="architecture-section" id="architecture">
        <div className="wrap">
          <div className="section-header text-center">
            <p className="eyebrow-accent">THE ART OF THE FORMULA</p>
            <h2>The Olfactory Architecture</h2>
            <p className="section-desc">
              A masterpiece fragrance is an unfolding symphony. Each noble
              essence evaporates at precise molecular tempos, ensuring your
              bespoke flacon evolves gracefully on warm skin from dawn to dusk.
            </p>
          </div>

          <div className="architecture-tabs">
            <button
              className={`arch-tab ${activeTierTab === "top" ? "is-active" : ""}`}
              onClick={() => setActiveTierTab("top")}
              type="button"
            >
              <span className="tab-tier">TIER I</span>
              <span className="tab-title">Top Notes · The Opening</span>
              <span className="tab-time">0 – 30 Minutes</span>
            </button>
            <button
              className={`arch-tab ${activeTierTab === "heart" ? "is-active" : ""}`}
              onClick={() => setActiveTierTab("heart")}
              type="button"
            >
              <span className="tab-tier">TIER II</span>
              <span className="tab-title">Heart Notes · The Soul</span>
              <span className="tab-time">30 Min – 4 Hours</span>
            </button>
            <button
              className={`arch-tab ${activeTierTab === "base" ? "is-active" : ""}`}
              onClick={() => setActiveTierTab("base")}
              type="button"
            >
              <span className="tab-tier">TIER III</span>
              <span className="tab-title">Base Notes · The Sillage</span>
              <span className="tab-time">4 – 24+ Hours</span>
            </button>
          </div>

          <div className="architecture-display">
            {activeTierTab === "top" && (
              <div className="arch-card">
                <div className="arch-info">
                  <span className="tier-badge-lg">
                    TOP TIER · VOLATILE ESSENCES
                  </span>
                  <h3>The Sparkling First Impression</h3>
                  <p>
                    Composed of lightweight citrus, ozonic salts, and delicate
                    herbals. These molecules burst forth the moment the atomizer
                    depresses, providing an immediate aura of exhilaration and
                    luminous vitality.
                  </p>
                  <div className="arch-notes-list">
                    <div className="arch-note-pill">
                      <img src="/images/39_lemon-imported.jpeg" alt="" />
                      <span>Calabrian Bergamot</span>
                    </div>
                    <div className="arch-note-pill">
                      <img src="/images/33_lavender-imported.png" alt="" />
                      <span>Highland Lavender</span>
                    </div>
                    <div className="arch-note-pill">
                      <img
                        src="/images/27_vetiver-tonic-by-urban-virtue.jpeg"
                        alt=""
                      />
                      <span>Brittany Sea Salt</span>
                    </div>
                  </div>
                </div>
                <div className="arch-meta">
                  <div className="meta-row">
                    <span>Projection:</span> <b>Radiant & Effervescent</b>
                  </div>
                  <div className="meta-row">
                    <span>Purpose:</span> <b>Immediate Hook & Freshness</b>
                  </div>
                  <div className="meta-row">
                    <span>Perfumery Role:</span> <b>The Overture</b>
                  </div>
                </div>
              </div>
            )}

            {activeTierTab === "heart" && (
              <div className="arch-card">
                <div className="arch-info">
                  <span className="tier-badge-lg">
                    HEART TIER · CORE HARMONY
                  </span>
                  <h3>The Emotional Identity & Resonance</h3>
                  <p>
                    As top notes settle, the opulent floral and botanical heart
                    unfurls. These noble absolutes define the memorable persona
                    of your bespoke creations, creating an indelible tactile
                    sillage that captures attention.
                  </p>
                  <div className="arch-notes-list">
                    <div className="arch-note-pill">
                      <img src="/images/30_taifi-rose-imported.png" alt="" />
                      <span>Taifi Rose Harvest</span>
                    </div>
                    <div className="arch-note-pill">
                      <img
                        src="/images/08_amberwood-musk-by-urban-virtue.jpeg"
                        alt=""
                      />
                      <span>Gilded Socotra Amber</span>
                    </div>
                    <div className="arch-note-pill">
                      <img src="/images/34_patchouli-imported.png" alt="" />
                      <span>Haitian Vetiver Roots</span>
                    </div>
                  </div>
                </div>
                <div className="arch-meta">
                  <div className="meta-row">
                    <span>Projection:</span> <b>Tactile, Alluring & Intimate</b>
                  </div>
                  <div className="meta-row">
                    <span>Purpose:</span> <b>Emotional Core of the Blend</b>
                  </div>
                  <div className="meta-row">
                    <span>Perfumery Role:</span> <b>The Aria</b>
                  </div>
                </div>
              </div>
            )}

            {activeTierTab === "base" && (
              <div className="arch-card">
                <div className="arch-info">
                  <span className="tier-badge-lg">
                    BASE TIER · ENDURING ANCHORS
                  </span>
                  <h3>The Enduring Memory & Alchemy</h3>
                  <p>
                    Heavy, resinous, and deeply comforting woods and balsams.
                    These dense molecules bind with your personal skin
                    chemistry, releasing warm balsamic trails that remain on
                    coats, scarfs, and collars for days.
                  </p>
                  <div className="arch-notes-list">
                    <div className="arch-note-pill">
                      <img
                        src="/images/10_black-oud-by-urban-virtue.jpeg"
                        alt=""
                      />
                      <span>Cambodian Royal Oud</span>
                    </div>
                    <div className="arch-note-pill">
                      <img src="/images/36_sandalwood-imported.png" alt="" />
                      <span>Sudanese Sandalwood</span>
                    </div>
                    <div className="arch-note-pill">
                      <img
                        src="/images/02_egyptian-vanilla-imported.jpeg"
                        alt=""
                      />
                      <span>Madagascar Bourbon Vanilla</span>
                    </div>
                  </div>
                </div>
                <div className="arch-meta">
                  <div className="meta-row">
                    <span>Projection:</span> <b>Deep, Seductive Sillage</b>
                  </div>
                  <div className="meta-row">
                    <span>Purpose:</span> <b>Fixative & Lasting Warmth</b>
                  </div>
                  <div className="meta-row">
                    <span>Perfumery Role:</span> <b>The Finale</b>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
