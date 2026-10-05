"use client";

/* eslint-disable @next/next/no-img-element -- the bottle is a stack of pixel-aligned render layers; next/image wrappers would break the alignment. */
import { useEffect } from "react";
import { startCustomBlend } from "./blend";

export default function CustomBlend() {
  useEffect(() => {
    startCustomBlend();
  }, []);

  return (
    <>
      <canvas className="ambient" id="ambient" aria-hidden="true" />
      <canvas className="fx" id="fx" aria-hidden="true" />

      <header className="site-header">
        <div className="wrap">
          <a className="brand" href="#top" aria-label="Urban Virtue home">
            <small>Washington, DC</small>
            <span>Urban Virtue</span>
          </a>
          <nav className="site-nav" aria-label="Main">
            <a href="#top">Home</a>
            <a href="#top">Shop</a>
            <a href="#mix" aria-current="page">Custom Blend</a>
            <a href="#top">Visit</a>
            <a href="#top">Contact</a>
          </nav>
          <div className="header-icons">
            <a className="icon-btn hide-sm" href="#top" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></svg>
            </a>
            <a className="icon-btn hide-sm" href="#top" aria-label="Wishlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" /></svg>
            </a>
            <a className="icon-btn" href="#top" aria-label="Bag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M5.5 8h13l-1 12h-11z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero" id="mix" aria-labelledby="hero-title">
          <div className="wrap">
            <div className="intro reveal">
              <p className="eyebrow">Custom blend studio</p>
              <h1 id="hero-title">
                <span className="w"><span>Create</span></span>{" "}
                <span className="w"><span>Your</span></span>{" "}
                <span className="w"><span><em>Signature</em></span></span>{" "}
                <span className="w"><span>Scent</span></span>
              </h1>
              <p className="lede">Pick two or three notes. Each one pours a third of the bottle, then we blend them into a perfume made only for you.</p>
              <hr className="rule" />
            </div>

            <div className="controls reveal reveal-2">
              <div id="blendBox">
                <div className="blend-head">
                  <ol className="steps" id="steps" aria-label="Progress">
                    <li data-step="1"><b>1</b>Pick notes</li>
                    <li data-step="2"><b>2</b>Mix</li>
                    <li data-step="3"><b>3</b>Add to bag</li>
                  </ol>
                  <span className="count" id="count" aria-label="Notes chosen">0 / 3</span>
                </div>
                <ol className="slots" id="slots" />
                <p className="status" id="status" aria-live="polite" />
              </div>

              <div className="buy-row">
                <div className="price"><small>Price</small><span id="price">[PRICE]</span></div>
                <div className="sizes" role="group" aria-label="Bottle size" id="sizes" />
              </div>

              <div className="actions" id="actions" />
            </div>

            <div className="stage reveal">
              <div className="deco" aria-hidden="true"><span className="deco-ring" /><span className="deco-ring deco-ring-2"><i /></span></div>
              <div className="bottle" id="bottle" role="img" aria-label="Your perfume bottle">
                <div className="bottle-frame" id="frame">
                  <img className="layer photo" src="/hero/bottle-empty.webp" alt="" width={720} height={960} fetchPriority="high" />
                  <div className="shadows" aria-hidden="true">
                    <span className="sh sh-cast" />
                    <span className="sh sh-ambient" />
                    <span className="sh sh-contact" />
                    <span className="sh sh-tint" id="shTint" />
                    <span className="sh sh-cap" />
                  </div>
                  <span className="stream" id="stream" />
                  <div className="liquid" id="liquid">
                    <img className="layer" src="/hero/bottle-liquid.webp" alt="" width={720} height={960} />
                    <div className="tint" id="tintLayers" />
                    <div className="tint tint-blend" id="tintBlend" />
                    <div className="tint tint-hue" id="tintHue" />
                    <div className="tint tint-hue tint-blend" id="tintHueBlend" />
                  </div>
                  <span className="surface" id="surface" />
                  <img className="layer glints" src="/hero/bottle-glints.webp" alt="" width={720} height={960} />
                  <div className="shine" id="shine" />
                  <div className="glare" id="glare" />
                  <div className="tag" id="tag">
                    <span className="tag-brand">Urban Virtue</span>
                    <span className="tag-name" id="tagName">Your Blend</span>
                    <span className="tag-notes" id="tagNotes">Pick 2 to 3 notes</span>
                  </div>
                  <div className="cap-pos" id="cap">
                    <div className="cap-float">
                      <img className="layer" src="/hero/bottle-cap.webp" alt="" width={720} height={960} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="notes reveal reveal-3" aria-labelledby="notes-title">
              <div className="notes-head">
                <div>
                  <h2 id="notes-title">Choose your notes</h2>
                  <p>Tap to pour. Tap again to remove.</p>
                </div>
                <button className="surprise" type="button" id="surprise">Surprise me</button>
              </div>
              <ul className="note-grid" id="noteGrid" />
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
