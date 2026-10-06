/* Urban Virtue: the Atelier Bag.
   The bag lives in an httpOnly cookie so it survives reloads without a database. Every item is
   re-validated and re-priced from lib/catalog on each read, so a hand-edited cookie can't change
   what a blend costs. Server-only: the cookie helpers use next/headers. Client code may
   `import type` from here. */

import { cookies } from "next/headers";
import {
  INSCRIPTION_MAX,
  MAX_QTY,
  MAX,
  MIN,
  findNote,
  findSize,
  formatPrice,
  formulaName,
  formulaNumber,
  type Note,
} from "./catalog";

const COOKIE = "uv_bag";
// Readable by page scripts so static pages (the shop) can show the badge without a server render.
// Holds only the item count; the bag itself stays in the httpOnly cookie.
export const COUNT_COOKIE = "uv_bag_count";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const MAX_LINES = 12;
export { MAX_QTY };

// What we persist: the patron's choices only, never prices or names
type StoredItem = {
  id: string;
  notes: string[];
  size: string;
  inscription: string;
  qty: number;
};

export type BagNote = Pick<Note, "id" | "name" | "tier" | "color" | "thumb" | "family">;

export type BagLine = {
  id: string;
  name: string;
  formulaNo: string;
  notes: BagNote[];
  size: { id: string; label: string; volume: string; name: string };
  inscription: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  unitPriceLabel: string;
  lineTotalLabel: string;
};

export type Bag = {
  items: BagLine[];
  count: number;
  subtotal: number;
  subtotalLabel: string;
};

export type BlendInput = { notes: string[]; size: string; inscription: string };

// ---------- Validation

function cleanInscription(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, INSCRIPTION_MAX);
}

function validNotes(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length < MIN || raw.length > MAX) return null;
  if (!raw.every((id) => typeof id === "string" && findNote(id))) return null;
  if (new Set(raw).size !== raw.length) return null;
  return raw as string[];
}

export function parseBlend(body: unknown): { blend: BlendInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Expected a JSON object." };
  const b = body as Record<string, unknown>;
  const notes = validNotes(b.notes);
  if (!notes) return { error: `Choose ${MIN} to ${MAX} different notes from the organ.` };
  if (typeof b.size !== "string" || !findSize(b.size)) return { error: "Unknown flacon size." };
  return { blend: { notes, size: b.size, inscription: cleanInscription(b.inscription) } };
}

export function parseQty(body: unknown): number | null {
  const qty = body && typeof body === "object" ? (body as Record<string, unknown>).qty : undefined;
  if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return null;
  return qty;
}

// ---------- Cookie encoding

function decode(raw: string | undefined): StoredItem[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const items: StoredItem[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const notes = validNotes(r.notes);
    if (typeof r.id !== "string" || !/^[a-z0-9]{6,32}$/.test(r.id)) continue;
    if (!notes || typeof r.size !== "string" || !findSize(r.size)) continue;
    const qty = typeof r.qty === "number" && Number.isInteger(r.qty) ? r.qty : 1;
    items.push({
      id: r.id,
      notes,
      size: r.size,
      inscription: cleanInscription(r.inscription),
      qty: Math.min(Math.max(qty, 1), MAX_QTY),
    });
    if (items.length >= MAX_LINES) break;
  }
  return items;
}

function encode(items: StoredItem[]): string {
  return Buffer.from(JSON.stringify(items), "utf8").toString("base64url");
}

// ---------- Pricing & display

function toLine(item: StoredItem): BagLine {
  const notes = item.notes.map((id) => findNote(id)!);
  const size = findSize(item.size)!;
  const unitPrice = size.rawPrice;
  const lineTotal = unitPrice * item.qty;
  return {
    id: item.id,
    name: formulaName(notes, item.inscription),
    formulaNo: formulaNumber(notes),
    notes: notes.map(({ id, name, tier, color, thumb, family }) => ({
      id,
      name,
      tier,
      color,
      thumb,
      family,
    })),
    size: { id: size.id, label: size.label, volume: size.volume, name: size.name },
    inscription: item.inscription,
    qty: item.qty,
    unitPrice,
    lineTotal,
    unitPriceLabel: formatPrice(unitPrice),
    lineTotalLabel: formatPrice(lineTotal),
  };
}

function toBag(items: StoredItem[]): Bag {
  const lines = items.map(toLine);
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  return {
    items: lines,
    count: lines.reduce((sum, l) => sum + l.qty, 0),
    subtotal,
    subtotalLabel: formatPrice(subtotal),
  };
}

// ---------- Store (Server Components may read; only Route Handlers may write)

async function readItems(): Promise<StoredItem[]> {
  return decode((await cookies()).get(COOKIE)?.value);
}

const cookieOptions = {
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};

async function writeCount(items: StoredItem[]): Promise<void> {
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  (await cookies()).set(COUNT_COOKIE, String(count), cookieOptions);
}

async function writeItems(items: StoredItem[]): Promise<void> {
  const store = await cookies();
  if (items.length) store.set(COOKIE, encode(items), { ...cookieOptions, httpOnly: true });
  else store.delete(COOKIE);
  await writeCount(items);
}

export async function getBag(): Promise<Bag> {
  return toBag(await readItems());
}

// For Route Handlers: read the bag and refresh the count cookie (covers bags saved before it existed)
export async function getBagAndSyncCount(): Promise<Bag> {
  const items = await readItems();
  await writeCount(items);
  return toBag(items);
}

export class BagFullError extends Error {}

// Adding the same formula, flacon and inscription again raises its quantity instead of a new line
export async function addToBag(blend: BlendInput): Promise<{ bag: Bag; itemId: string }> {
  const items = await readItems();
  const same = items.find(
    (i) =>
      i.size === blend.size &&
      i.inscription === blend.inscription &&
      i.notes.join() === blend.notes.join(),
  );

  let itemId: string;
  if (same) {
    same.qty = Math.min(same.qty + 1, MAX_QTY);
    itemId = same.id;
  } else {
    if (items.length >= MAX_LINES) {
      throw new BagFullError(`Your bag holds up to ${MAX_LINES} different formulas.`);
    }
    itemId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    items.push({ id: itemId, ...blend, qty: 1 });
  }

  await writeItems(items);
  return { bag: toBag(items), itemId };
}

export async function setQuantity(id: string, qty: number): Promise<Bag | null> {
  const items = await readItems();
  const item = items.find((i) => i.id === id);
  if (!item) return null;
  item.qty = qty;
  await writeItems(items);
  return toBag(items);
}

export async function removeFromBag(id: string): Promise<Bag | null> {
  const items = await readItems();
  const next = items.filter((i) => i.id !== id);
  if (next.length === items.length) return null;
  await writeItems(next);
  return toBag(next);
}

export async function clearBag(): Promise<Bag> {
  await writeItems([]);
  return toBag([]);
}
