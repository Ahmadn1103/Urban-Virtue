/* Urban Virtue: the ready-made collection, read from assests/products.csv.
   Each row's "Local image file" (images/NN_slug.ext) is served from public/images, and its
   filename (minus the NN_ order prefix) becomes the product's URL slug. Server-only: uses fs.
   Client components may `import type` from here. */

import fs from "node:fs";
import path from "node:path";

const CSV_PATH = path.join(process.cwd(), "assests", "products.csv");

export type Category = { id: string; label: string; count: number };

export type Product = {
  slug: string;
  order: number;
  name: string; // "Ahoud (Bedazzled)"
  house: string | null; // "Urban Virtue", "Gissah"…
  imported: boolean;
  byline: string; // line above the name: the house, else "Single Note Oil" / "Imported" / collection
  categories: { id: string; label: string }[];
  priceMin: number;
  priceMax: number;
  priceLabel: string; // "$19.99 – $79.99"
  image: string; // "/images/01_ahoud-bedazzled-by-urban-virtue.jpeg"
  tagline: string | null; // all-caps lines such as `AKA "555"`
  intro: string | null; // prose before the notes
  notes: { top: string[]; heart: string[]; base: string[] } | null;
  profile: string[] | null; // single notes: "Dry wood • Resin • …"
  mood: string | null;
  credit: string | null; // photo credits embedded in the notes text
  searchText: string;
};

// ---------- CSV

// RFC 4180: quoted fields may hold commas, newlines and "" escapes
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((f) => f.trim())) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim())) rows.push(row);
  return rows;
}

// ---------- Text helpers

const SMALL_WORDS = new Set(["and", "of", "the", "by", "for", "de", "du"]);
const KEEP_UPPER = new Set(["VA", "UV"]);

function titleCase(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .map((word, i) => {
      const bare = word.replace(/[^A-Za-z]/g, "");
      if (KEEP_UPPER.has(bare)) return word;
      const lower = word.toLowerCase();
      if (i > 0 && SMALL_WORDS.has(lower)) return lower;
      return lower.replace(/[a-z]/, (ch) => ch.toUpperCase());
    })
    .join(" ");
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isShouting(s: string): boolean {
  const letters = s.replace(/[^A-Za-z]/g, "");
  return letters.length >= 3 && letters === letters.toUpperCase();
}

function splitList(s: string): string[] {
  return s
    .replace(/\.\s*$/, "")
    .split(",")
    .map((x) => x.trim().replace(/^and\s+/i, ""))
    .filter(Boolean);
}

function money(n: number): string {
  return "$" + n.toFixed(2);
}

// ---------- Description → intro, notes pyramid or single-note profile

function parseDescription(text: string) {
  let rest = text.replace(/\s+/g, " ").trim();
  let credit: string | null = null;
  let profile: string[] | null = null;
  let mood: string | null = null;
  let notes: Product["notes"] = null;

  // Trailing all-caps credit, e.g. "… Amber GLASSES BY YVETTE CROCKER"
  const creditMatch = rest.match(/\s+((?:[A-Z']{2,}\s)+BY(?:\s[A-Z']{2,})+)$/);
  if (creditMatch) {
    credit = titleCase(creditMatch[1]);
    rest = rest.slice(0, creditMatch.index).trim();
  }

  // Single-note oils: "<prose> Scent Profile: a • b • c Mood: …"
  const profileAt = rest.search(/Scent Profile:/i);
  if (profileAt >= 0) {
    const tail = rest.slice(profileAt).replace(/^Scent Profile:\s*/i, "");
    const [profileText, moodText] = tail.split(/\s*Mood:\s*/i);
    profile = profileText.split("•").map((x) => x.trim()).filter(Boolean);
    mood = moodText ? moodText.trim() : null;
    rest = rest.slice(0, profileAt).trim();
  }

  // Parfums: "<prose> Top Notes: … Middle|Heart Notes: … Base Notes: …"
  const marker = /(Top|Middle|Heart|Base)\s+Notes?\s*:/gi;
  const marks = [...rest.matchAll(marker)];
  if (marks.length) {
    notes = { top: [], heart: [], base: [] };
    marks.forEach((m, i) => {
      const start = m.index! + m[0].length;
      const end = i + 1 < marks.length ? marks[i + 1].index! : rest.length;
      const tier = m[1].toLowerCase();
      const key = tier === "top" ? "top" : tier === "base" ? "base" : "heart";
      notes![key].push(...splitList(rest.slice(start, end)));
    });
    rest = rest.slice(0, marks[0].index).trim();
  }

  let tagline: string | null = null;
  let intro: string | null = rest || null;
  if (intro && isShouting(intro)) {
    tagline = intro;
    intro = null;
  }
  return { tagline, intro, notes, profile, mood, credit };
}

// ---------- Load

function load(): Product[] {
  const [header, ...rows] = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const col = (name: string) => {
    const i = header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
    if (i < 0) throw new Error(`products.csv is missing the "${name}" column`);
    return i;
  };
  const C = {
    name: col("Name"),
    categories: col("Categories"),
    price: col("Price range"),
    description: col("Description / notes"),
    file: col("Local image file"),
  };

  return rows.map((r, i) => {
    const file = path.basename(r[C.file].trim()); // "01_ahoud-bedazzled-by-urban-virtue.jpeg"
    const slug = file.replace(/^\d+_/, "").replace(/\.[a-z]+$/i, "");

    let rawName = r[C.name].trim();
    const imported = /\(IMPORTED\)/i.test(rawName);
    rawName = rawName.replace(/\s*\(IMPORTED\)\s*/i, " ").trim();
    const [namePart, housePart] = rawName.split(/\s+By\s+/);

    const categories = r[C.categories]
      .split(";")
      .map((c) => c.replace(/\p{Extended_Pictographic}/gu, "").trim())
      .filter(Boolean)
      .map((label) => ({ id: slugify(label), label: label.replace(/\s+Parfum$/i, "") }));

    const prices = (r[C.price].match(/\d+(?:\.\d+)?/g) || ["0"]).map(Number);
    const priceMin = Math.min(...prices);
    const priceMax = Math.max(...prices);

    const name = titleCase(namePart);
    const house = housePart ? housePart.trim() : null;
    const byline =
      house ??
      (categories.some((c) => c.id === "single-notes")
        ? "Single Note Oil"
        : imported
          ? "Imported"
          : (categories[0]?.label ?? "Urban Virtue"));
    const d = parseDescription(r[C.description]);
    const noteWords = d.notes ? [...d.notes.top, ...d.notes.heart, ...d.notes.base] : d.profile || [];

    return {
      slug,
      order: i + 1,
      name,
      house,
      imported,
      byline,
      categories,
      priceMin,
      priceMax,
      priceLabel: priceMin === priceMax ? money(priceMin) : `${money(priceMin)} – ${money(priceMax)}`,
      image: "/images/" + file,
      ...d,
      searchText: [name, house, ...categories.map((c) => c.label), ...noteWords, d.mood]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    };
  });
}

let cache: Product[] | null = null;

export function getProducts(): Product[] {
  // Re-read in development so edits to the CSV show up on refresh
  if (!cache || process.env.NODE_ENV === "development") cache = load();
  return cache;
}

export function getProduct(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}

// Categories in order of first appearance, with product counts
export function getCategories(products = getProducts()): Category[] {
  const map = new Map<string, Category>();
  products.forEach((p) =>
    p.categories.forEach((c) => {
      const hit = map.get(c.id);
      if (hit) hit.count++;
      else map.set(c.id, { ...c, count: 1 });
    }),
  );
  return [...map.values()];
}

// Products sharing the most categories, nearest in catalog order first
export function getRelated(product: Product, limit = 4): Product[] {
  const ids = new Set(product.categories.map((c) => c.id));
  return getProducts()
    .filter((p) => p.slug !== product.slug)
    .map((p) => ({ p, score: p.categories.filter((c) => ids.has(c.id)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || Math.abs(a.p.order - product.order) - Math.abs(b.p.order - product.order))
    .slice(0, limit)
    .map((x) => x.p);
}

// What a product card needs: keeps long descriptions out of the browse page's client payload
export type CardProduct = Pick<
  Product,
  "slug" | "order" | "name" | "byline" | "imported" | "categories" | "priceMin" | "priceMax" | "priceLabel" | "image" | "searchText"
> & { preview: string[] };

export function toCard(p: Product): CardProduct {
  const { slug, order, name, byline, imported, categories, priceMin, priceMax, priceLabel, image, searchText } = p;
  const preview = (p.notes ? [...p.notes.top, ...p.notes.heart] : p.profile || []).slice(0, 3);
  return { slug, order, name, byline, imported, categories, priceMin, priceMax, priceLabel, image, searchText, preview };
}
