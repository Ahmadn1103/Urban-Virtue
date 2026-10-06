"use client";

import { useState } from "react";

export type ProductOption = { id: string; label: string; priceLabel: string };

// Size picker + Add to Bag. Products have no sizes or per-size prices yet (products.csv only
// lists a range), so the picker reads "No options yet" and the button stays disabled. Once
// options are supplied, a choice enables the button; the bag API still needs to learn
// ready-made products before it can add them.
export default function ProductPurchase({ options = [] }: { options?: ProductOption[] }) {
  const [choice, setChoice] = useState("");
  const none = options.length === 0;
  const picked = options.find((o) => o.id === choice);

  return (
    <div className="product-purchase">
      <label className="product-option">
        <span>Select an option</span>
        <select value={choice} onChange={(e) => setChoice(e.target.value)} disabled={none}>
          <option value="" disabled>
            {none ? "No options yet" : "Choose a size"}
          </option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label} · {o.priceLabel}
            </option>
          ))}
        </select>
      </label>
      <button className="btn btn-primary btn-gold product-add" type="button" disabled={!picked}>
        <span className="btn-shine" />
        <span className="btn-text">{picked ? `Add to Bag · ${picked.priceLabel}` : "Add to Bag"}</span>
      </button>
      {none && <p className="product-option-note">Sizes and pricing are coming soon.</p>}
    </div>
  );
}
