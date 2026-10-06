/* Urban Virtue: still images of sealed flacons for the Atelier Bag.
   One offscreen WebGL renderer poses the studio's 3D flacon for each blend and snapshots it, so
   the glass shaders compile once instead of once per bag item. Stills are cached in memory and in
   sessionStorage, and the studio primes the cache on "Add to Bag" so the bag page opens with its
   bottles already drawn. Client-only. */

import { MAX, SIZES, labelNotes, mixColor } from "./catalog";

export type FlaconLook = {
  size: string;
  name: string;
  notes: { name: string; color: string }[];
  width?: number; // CSS px of the 3:4 frame (default 180, the bag card); rendered at 2x
};

const VERSION = "2"; // bump when the flacon's look changes, to drop stale stills
const STORE_PREFIX = "uv_still:";
const memory = new Map<string, string>();

// A bag line (from /api/bag) as the flacon it describes
export function lookOfLine(line: {
  size: { id: string };
  name: string;
  notes: { name: string; color: string }[];
}): FlaconLook {
  return { size: line.size.id, name: line.name, notes: line.notes };
}

export function lookKey(look: FlaconLook): string {
  return [VERSION, look.width ?? 180, look.size, look.name, ...look.notes.map((n) => n.name + n.color)].join("|");
}

export function cachedStill(look: FlaconLook): string | undefined {
  const key = lookKey(look);
  let url = memory.get(key);
  if (!url) {
    try {
      url = sessionStorage.getItem(STORE_PREFIX + key) ?? undefined;
    } catch {}
    if (url) memory.set(key, url);
  }
  return url;
}

function remember(key: string, url: string) {
  memory.set(key, url);
  try {
    sessionStorage.setItem(STORE_PREFIX + key, url);
  } catch {} // full or blocked storage: the in-memory copy still serves this page
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

// Renders run one batch at a time so there's never more than one extra WebGL context
let queue: Promise<unknown> = Promise.resolve();

export function renderStills(
  looks: FlaconLook[],
  onStill?: (key: string, url: string) => void,
): Promise<void> {
  const run = queue.then(() => renderBatch(looks, onStill));
  queue = run.catch(() => {});
  return run;
}

async function renderBatch(looks: FlaconLook[], onStill?: (key: string, url: string) => void) {
  const todo = new Map<string, FlaconLook>();
  for (const look of looks) {
    const key = lookKey(look);
    const hit = cachedStill(look);
    if (hit) onStill?.(key, hit);
    else todo.set(key, look);
  }
  if (!todo.size) return;

  const { createFlacon3D } = await import("@/components/hero/flacon3d");

  // Same 3:4 frame as the bag card; rendered at 2x for sharp edges
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:180px;height:240px;pointer-events:none;";
  document.body.appendChild(host);

  let flacon: ReturnType<typeof createFlacon3D> | null = null;
  try {
    flacon = createFlacon3D({
      host,
      sizes: SIZES,
      sizeId: todo.values().next().value!.size,
      logoSrc: "/logo.jpeg",
      reduceMotion: true,
      still: true,
    });
    await flacon.labelsReady;

    for (const [key, look] of todo) {
      const colors = look.notes.map((n) => n.color);
      flacon.setSize(look.size);
      flacon.setLabel({ name: look.name, notes: labelNotes(look.notes) });
      flacon.setLiquid(colors, MAX, mixColor(look.notes));
      flacon.setBlended(true);
      const w = look.width ?? 180;
      host.style.width = w + "px";
      host.style.height = Math.round((w * 4) / 3) + "px";
      flacon.settle();
      const url = flacon.snapshot();
      remember(key, url);
      onStill?.(key, url);
      await nextFrame(); // let the page paint between bottles
    }
  } finally {
    flacon?.dispose();
    host.remove();
  }
}
