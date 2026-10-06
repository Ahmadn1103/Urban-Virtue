"use client";

/* eslint-disable @next/next/no-img-element -- data-URL snapshot of the 3D flacon (lib/flaconStills) */
import { useEffect, useState } from "react";
import { SAMPLE_BLEND, formulaName } from "@/lib/catalog";
import { lookKey, renderStills, type FlaconLook } from "@/lib/flaconStills";

// The studio's real flacon as a still image, with a shimmer silhouette until it's drawn
export default function StudioFlacon({ width, className = "" }: { width: number; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const look: FlaconLook = { size: "50", name: formulaName(SAMPLE_BLEND), notes: SAMPLE_BLEND, width };
    const key = lookKey(look);
    let live = true;
    renderStills([look], (k, url) => {
      if (live && k === key) setSrc(url);
    }).catch(() => {}); // no WebGL: the silhouette stays
    return () => {
      live = false;
    };
  }, [width]);

  return (
    <div className={"studio-flacon " + className} aria-hidden="true">
      {src ? (
        <img src={src} alt="" width={width} height={Math.round((width * 4) / 3)} />
      ) : (
        <div className="flacon-skeleton">
          <span className="flacon-skeleton-cap" />
          <span className="flacon-skeleton-body" />
        </div>
      )}
    </div>
  );
}
