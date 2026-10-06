"use client";

import { useSyncExternalStore } from "react";

const COUNT_COOKIE = "uv_bag_count"; // written by lib/bag.ts

// One bag count for the whole tab. It lives outside React, so every page's header shows the same
// number straight away after a navigation instead of starting from zero. It changes only when
// the bag does: blend.js (add) and BagView (quantity, remove) dispatch "uv:bag-count".
let count: number | null = null;
const listeners = new Set<() => void>();

function readCookie(): number | null {
  const m = document.cookie.match(new RegExp("(?:^|; )" + COUNT_COOKIE + "=(\\d+)"));
  return m ? Number(m[1]) : null;
}

function set(n: number) {
  if (n === count) return;
  count = n;
  listeners.forEach((fn) => fn());
}

let wired = false;
function wire() {
  if (wired) return;
  wired = true;
  window.addEventListener("uv:bag-count", (e) => set((e as CustomEvent<number>).detail));
  // Back/forward cache restores an old page: re-read in case the bag changed meanwhile
  window.addEventListener("pageshow", () => {
    const n = readCookie();
    if (n !== null) set(n);
  });
  // Bags saved before the count cookie existed: ask the API once (it also sets the cookie)
  if (readCookie() === null) {
    fetch("/api/bag")
      .then((r) => (r.ok ? r.json() : null))
      .then((bag) => bag && set(bag.count))
      .catch(() => {});
  }
}

function subscribe(fn: () => void) {
  wire();
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot(): number {
  if (count === null) count = readCookie() ?? 0;
  return count;
}

const getServerSnapshot = () => 0; // static HTML has no bag; the count appears on hydration

export default function BagBadge() {
  const n = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <span className="bag-badge" id="cartCounter" data-react-badge="" style={{ display: n > 0 ? "inline-flex" : "none" }}>
      {n}
    </span>
  );
}
