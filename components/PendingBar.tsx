"use client";

import { useEffect } from "react";
import { useLinkStatus } from "next/link";

// Place inside a <Link>. While that link's page is still loading it sets <html data-navigating>,
// which runs one progress bar along the top of the window (see hero.css). Skipped when the page
// was prefetched and opens instantly.
export default function PendingBar() {
  const { pending } = useLinkStatus();
  useEffect(() => {
    if (!pending) return;
    const root = document.documentElement;
    root.setAttribute("data-navigating", "");
    return () => root.removeAttribute("data-navigating");
  }, [pending]);
  return null;
}
