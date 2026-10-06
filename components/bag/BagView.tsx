"use client";

/* eslint-disable @next/next/no-img-element -- small note thumbnails */
import Link from "next/link";
import { useEffect, useState } from "react";
import PendingBar from "@/components/PendingBar";
import SiteHeader from "@/components/SiteHeader";
import BagFlacon from "./BagFlacon";
import type { Bag, BagLine } from "@/lib/bag";
import { MAX_QTY } from "@/lib/catalog";
import { lookKey, lookOfLine, renderStills } from "@/lib/flaconStills";

export default function BagView({ initialBag }: { initialBag: Bag }) {
  const [bag, setBag] = useState(initialBag);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [stills, setStills] = useState<Record<string, string>>({});
  const [stillsFailed, setStillsFailed] = useState(false);

  // Keep every header badge (the shared store in BagBadge) on the bag's real count
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("uv:bag-count", { detail: bag.count }));
  }, [bag.count]);

  // Bottles come from the session cache when the studio primed them, else render once here
  const lookKeys = bag.items.map((l) => lookKey(lookOfLine(l))).join(",");
  useEffect(() => {
    let live = true;
    renderStills(bag.items.map(lookOfLine), (key, url) => {
      if (live) setStills((s) => (s[key] === url ? s : { ...s, [key]: url }));
    }).catch(() => {
      if (live) setStillsFailed(true);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the set of looks changes
  }, [lookKeys]);

  async function send(id: string, init: RequestInit) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/bag/${id}`, {
        ...init,
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        // Stale tab: the item was removed elsewhere, so resync with the server
        const fresh = await fetch("/api/bag");
        if (fresh.ok) setBag(await fresh.json());
      }
      if (!res.ok) throw new Error(data.error || "We couldn't update your bag. Please try again.");
      setBag(data);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "We couldn't reach the atelier. Check your connection and try again."
          : (err as Error).message,
      );
    } finally {
      setBusyId(null);
    }
  }

  const setQty = (line: BagLine, qty: number) =>
    send(line.id, { method: "PATCH", body: JSON.stringify({ qty }) });
  const remove = (line: BagLine) => send(line.id, { method: "DELETE" });

  const empty = bag.items.length === 0;

  return (
    <div className="atelier-root bag-root">
      <SiteHeader current="bag" />

      <main className="wrap bag-page">
        <header className="bag-head">
          <p className="bag-eyebrow">✦ Atelier Bag</p>
          <h1 className="bag-title">Your Bespoke Formulas</h1>
          <p className="bag-sub">
            {empty
              ? "Nothing has been sealed for you yet."
              : `${bag.count} flacon${bag.count === 1 ? "" : "s"} composed in the studio, awaiting the seal.`}
          </p>
        </header>

        {error && (
          <p className="bag-error" role="alert">
            {error}
          </p>
        )}

        {empty ? (
          <section className="bag-empty">
            <div className="bag-empty-flacon" aria-hidden="true">
              <span />
            </div>
            <h2>Your bag is empty</h2>
            <p>
              Pick two or three noble essences in the studio, harmonize them, and add your signature
              flacon here.
            </p>
            <Link className="btn btn-primary is-ready" href="/custom-studio"><PendingBar />
              <span className="btn-shine" />
              <span className="btn-text">✦ Compose a Blend</span>
            </Link>
          </section>
        ) : (
          <div className="bag-layout">
            <ol className="bag-list" aria-label="Formulas in your bag">
              {bag.items.map((line) => (
                <BagItem
                  key={line.id}
                  line={line}
                  still={stills[lookKey(lookOfLine(line))]}
                  stillFailed={stillsFailed}
                  busy={busyId === line.id}
                  onQty={(q) => setQty(line, q)}
                  onRemove={() => remove(line)}
                />
              ))}
            </ol>

            <aside className="bag-summary" aria-label="Order summary">
              <h2>Summary</h2>
              <dl>
                {bag.items.map((line) => (
                  <div className="bag-summary-row" key={line.id}>
                    <dt>
                      {line.name}
                      <small>
                        {line.size.label} × {line.qty}
                      </small>
                    </dt>
                    <dd>{line.lineTotalLabel}</dd>
                  </div>
                ))}
                <div className="bag-summary-row is-total">
                  <dt>Subtotal</dt>
                  <dd>{bag.subtotalLabel}</dd>
                </div>
              </dl>
              <p className="bag-note">Taxes and delivery are calculated at checkout.</p>
              <button className="btn btn-primary bag-checkout" type="button" disabled>
                Checkout · Coming Soon
              </button>
              <Link className="btn btn-ghost bag-continue" href="/custom-studio"><PendingBar />
                Compose Another Blend
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function BagItem({
  line,
  still,
  stillFailed,
  busy,
  onQty,
  onRemove,
}: {
  line: BagLine;
  still?: string;
  stillFailed: boolean;
  busy: boolean;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className={"bag-item" + (busy ? " is-busy" : "")} aria-busy={busy}>
      <BagFlacon line={line} src={still} failed={stillFailed} />

      <div className="bag-item-body">
        <p className="bag-item-no">Formula No. {line.formulaNo}</p>
        <h2 className="bag-item-name">{line.name}</h2>
        <p className="bag-item-size">
          {line.size.name} · {line.size.label} ({line.size.volume})
        </p>

        <ul className="bag-notes" aria-label="Notes">
          {line.notes.map((n) => (
            <li key={n.id}>
              <img src={n.thumb} alt="" width={28} height={28} />
              <span>
                {n.name}
                <small>
                  {n.tier} · {n.family}
                </small>
              </span>
            </li>
          ))}
        </ul>

        {line.inscription && (
          <p className="bag-inscription">
            Inscribed: <em>“{line.inscription}”</em>
          </p>
        )}

        <div className="bag-item-foot">
          <div className="bag-qty" role="group" aria-label={`Quantity of ${line.name}`}>
            <button
              type="button"
              onClick={() => onQty(line.qty - 1)}
              disabled={busy || line.qty <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <output aria-live="polite">{line.qty}</output>
            <button
              type="button"
              onClick={() => onQty(line.qty + 1)}
              disabled={busy || line.qty >= MAX_QTY}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button type="button" className="bag-remove" onClick={onRemove} disabled={busy}>
            Remove
          </button>
          <p className="bag-item-price">
            {line.lineTotalLabel}
            {line.qty > 1 && <small>{line.unitPriceLabel} each</small>}
          </p>
        </div>
      </div>
    </li>
  );
}
