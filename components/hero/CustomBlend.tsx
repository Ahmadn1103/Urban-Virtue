"use client";

/* eslint-disable @next/next/no-img-element -- dynamic photo elements and the WebGL fallback still. */
import { useEffect, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

type Props = {
  variant?: "home" | "shop"; // home: header, studio, footer · shop: just the studio, under the shop layout
};

export default function CustomBlend({ variant = "home" }: Props) {
  const home = variant === "home";
  const Main = home ? "main" : "div"; // the shop page provides its own <main>
  const router = useRouter();

  // The studio engine (and, after it, three.js) loads in its own chunk, so the page and its
  // skeletons paint first. It stops on unmount, so navigating away and back restarts it cleanly.
  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    import("./blend").then(({ startCustomBlend }) => {
      if (!cancelled) stop = startCustomBlend();
    });
    // Start fetching three.js alongside, rather than after blend.js asks for it
    import("./flacon3d");
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  // blend.js renders plain <a> tags (e.g. "View Your Bag"): route them client-side for instant opens
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element).closest("a");
    const href = a?.getAttribute("href");
    if (!a || !href?.startsWith("/") || a.closest("header, footer, nav") || a.target) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    router.push(href);
  };

  return (
    <div className={home ? "atelier-root" : "studio-embed"} onClick={onClick}>
      {/* Background ambient lighting canvas */}
      <canvas className="ambient" id="ambient" aria-hidden="true" />

      {/* Site Header */}
      {home && <SiteHeader current="studio" />}

      {/* Main Experience */}
      <Main id="top">
        {/* ============================================================== */}
        {/* HERO: BESPOKE BLEND STUDIO WITH REALISTIC FLACON & SPLASHES    */}
        {/* ============================================================== */}
        <section className="hero" id="custom-studio" aria-labelledby="hero-title">
          <div className="wrap hero-grid">
            {/* LEFT CONSOLE: ATELIER FORMULATION */}
            <div className="intro-controls">
              <h1 id="hero-title" className="sr-only">
                Urban Virtue Custom Blend Studio
              </h1>

              {/* Formulation Console */}
              <div className="console-panel" id="blendBox">
                <div className="console-header">
                  <ol className="steps-list" id="steps" aria-label="Blending Progress">
                    <li data-step="1" className="is-active">
                      <span className="step-num">1</span>
                      <span className="step-txt">Pick</span>
                    </li>
                    <li data-step="2">
                      <span className="step-num">2</span>
                      <span className="step-txt">Blend</span>
                    </li>
                    <li data-step="3">
                      <span className="step-num">3</span>
                      <span className="step-txt">Seal</span>
                    </li>
                  </ol>
                  <div className="counter-reset-wrap">
                    <span className="tier-counter" id="count" aria-label="Notes selected">
                      0 / 3
                    </span>
                    <button className="reset-btn" id="resetBtn" type="button" title="Start over with an empty flacon">
                      ✦ Reset
                    </button>
                  </div>
                </div>

                {/* Slots */}
                <ol className="formula-slots" id="slots" />
                {/* Loading skeletons: each shows until blend.js fills the container just before it */}
                <ol className="formula-slots skel-after" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <li key={i}>
                      <div className="slot skel-shimmer" />
                    </li>
                  ))}
                </ol>
                <p className="status-narrative" id="status" aria-live="polite">
                  Select your first noble essence to begin the pour.
                </p>

                {/* Live Scent Accord Breakdown */}
                <div className="accord-box" id="accordBreakdown">
                  <div
                    className="accord-composite-track"
                    title="Accord balance spectrum"
                  >
                    <span style={{ width: "20%", background: "#e25c80" }} />
                    <span style={{ width: "20%", background: "#ba7b43" }} />
                    <span style={{ width: "20%", background: "#3fa7ba" }} />
                    <span style={{ width: "20%", background: "#dca74e" }} />
                    <span style={{ width: "20%", background: "#c96218" }} />
                  </div>
                  <div className="accord-labels-row">
                    <span className="accord-tag">
                      <i style={{ background: "#e25c80" }} />
                      Floral 20%
                    </span>
                    <span className="accord-tag">
                      <i style={{ background: "#ba7b43" }} />
                      Woody 20%
                    </span>
                    <span className="accord-tag">
                      <i style={{ background: "#3fa7ba" }} />
                      Fresh 20%
                    </span>
                    <span className="accord-tag">
                      <i style={{ background: "#dca74e" }} />
                      Gourmand 20%
                    </span>
                    <span className="accord-tag">
                      <i style={{ background: "#c96218" }} />
                      Oriental 20%
                    </span>
                  </div>
                </div>

                {/* Bottle Size Selector & Price */}
                <div className="flacon-tier-selector">
                  <div className="price-display">
                    <span className="price-val" id="price">
                      $85.00
                    </span>
                  </div>
                  <div className="sizes-pill-group" role="group" aria-label="Flacon volume" id="sizes" />
                  <div className="sizes-pill-group skel-after" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="size skel-shimmer skel-pill" />
                    ))}
                  </div>
                </div>

                {/* Personalize Label Input */}
                <div className="personalize-box">
                  <label htmlFor="customNameInput" className="personalize-label">
                    <span>Flacon Inscription</span>
                  </label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      id="customNameInput"
                      placeholder="e.g. Velvet Solstice, No. 07, Your Name"
                      maxLength={24}
                    />
                    <span className="gold-seal-icon">✦</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="actions-cluster" id="actions" />
                <div className="actions-cluster skel-after" aria-hidden="true">
                  <span className="btn skel-shimmer skel-btn" />
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* CENTER STAGE: THE REALISTIC BOTTLE & BOTANICAL INGREDIENTS     */}
            {/* ============================================================== */}
            <div className="stage" id="stageContainer">
              {/* Dynamic Volumetric Background Elements */}
              <div className="stage-backdrop" aria-hidden="true">
                <div className="stage-glow" id="stageGlow" />
                <div className="stage-caustic" id="stageCaustic" />

                {/* BOTANICAL RAW INGREDIENTS FLORA LAYER */}
                <div className="botanical-stage" id="botanicalStage" />
              </div>

              {/* The Glass Flacon: real-time 3D render (30 / 50 / 100 ml) mounted by flacon3d.js */}
              <div className="bottle" id="bottle" role="img" aria-label="Your bespoke Urban Virtue perfume flacon in 3D">
                <div className="bottle-frame" id="frame">
                  <img
                    className="flacon-fallback"
                    src="/hero/bottle-empty.webp"
                    alt=""
                    width={720}
                    height={960}
                  />
                </div>
                {/* Shown until the 3D flacon draws its first frame */}
                <div className="flacon-skeleton bottle-skeleton" aria-hidden="true">
                  <span className="flacon-skeleton-cap" />
                  <span className="flacon-skeleton-body" />
                </div>
              </div>

            </div>

            {/* ============================================================== */}
            {/* RIGHT CONSOLE: THE NOBLE SCENT ORGAN                           */}
            {/* ============================================================== */}
            <aside className="notes-console" aria-labelledby="organ-title">
              <div className="organ-head">
                <div>
                  <span className="organ-tag">9 NOBLE ESSENCES</span>
                  <h2 id="organ-title">The Fragrance Organ</h2>
                </div>
                <button
                  className="surprise-btn"
                  type="button"
                  id="surprise"
                  title="Let our Master Perfumer curate a signature surprise formula"
                >
                  <span className="sparkle">✦</span> Surprise Me
                </button>
              </div>

              {/* Grid of 9 Artisanal Notes */}
              <ul className="note-grid" id="noteGrid" />
              <ul className="note-grid skel-after" aria-hidden="true">
                {Array.from({ length: 9 }, (_, i) => (
                  <li key={i}>
                    <span className="note skel-note">
                      <span className="note-img skel-shimmer" />
                      <span className="skel-line skel-shimmer" />
                      <span className="skel-line skel-line-short skel-shimmer" />
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>
      </Main>

      {/* ============================================================== */}
      {/* LUXURY EDITORIAL FOOTER                                         */}
      {/* ============================================================== */}
      {home && <SiteFooter />}
    </div>
  );
}
