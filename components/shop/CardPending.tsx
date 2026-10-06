"use client";

import { useLinkStatus } from "next/link";

// Spinner over a product card while its page opens (shown only if the page wasn't prefetched yet)
export default function CardPending() {
  const { pending } = useLinkStatus();
  return (
    <span className={"card-pending" + (pending ? " is-pending" : "")} aria-hidden="true">
      <span className="card-spinner" />
    </span>
  );
}
