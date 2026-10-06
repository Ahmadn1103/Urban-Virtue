/* Urban Virtue: fragrance catalog shared by the blend studio (client) and the bag API (server).
   The server prices bag items from this file, never from what the browser sends. */

export const NOTES = [
  {
    id: "rose",
    name: "Taifi Rose",
    family: "Floral",
    mood: "velvet petals & honeyed dew",
    origin: "Taif, Saudi Arabia",
    tier: "heart",
    color: "#e25c80",
    accent: "#f48fb1",
    adj: "Velvet",
    noun: "Rose",
    accords: { floral: 85, fresh: 15, woody: 0, oriental: 0, gourmand: 0 },
    image: "/images/30_taifi-rose-imported.png",
    thumb: "/hero/note-rose.webp",
  },
  {
    id: "bergamot",
    name: "Calabrian Bergamot",
    family: "Citrus",
    mood: "sunlit zest & sparkling peel",
    origin: "Calabria, Italy",
    tier: "top",
    color: "#e89f28",
    accent: "#ffd54f",
    adj: "Golden",
    noun: "Citron",
    accords: { floral: 0, fresh: 80, woody: 0, oriental: 0, gourmand: 20 },
    image: "/images/39_lemon-imported.jpeg",
    thumb: "/hero/note-bergamot.webp",
  },
  {
    id: "oud",
    name: "Cambodian Oud",
    family: "Woody",
    mood: "ancient smoke & dark resin",
    origin: "Koh Kong, Cambodia",
    tier: "base",
    color: "#683925",
    accent: "#a0522d",
    adj: "Royal",
    noun: "Oud",
    accords: { floral: 0, fresh: 0, woody: 75, oriental: 25, gourmand: 0 },
    image: "/images/10_black-oud-by-urban-virtue.jpeg",
    thumb: "/hero/note-oud.webp",
  },
  {
    id: "vanilla",
    name: "Bourbon Vanilla",
    family: "Gourmand",
    mood: "caramelized pod & silken cream",
    origin: "Madagascar",
    tier: "base",
    color: "#dca74e",
    accent: "#ffe082",
    adj: "Silken",
    noun: "Vanilla",
    accords: { floral: 10, fresh: 0, woody: 0, oriental: 30, gourmand: 60 },
    image: "/images/02_egyptian-vanilla-imported.jpeg",
    thumb: "/hero/note-vanilla.webp",
  },
  {
    id: "lavender",
    name: "Highland Lavender",
    family: "Aromatic",
    mood: "wild herbs & twilight haze",
    origin: "Provence, France",
    tier: "top",
    color: "#896bc8",
    accent: "#b39ddb",
    adj: "Twilight",
    noun: "Lavender",
    accords: { floral: 40, fresh: 50, woody: 10, oriental: 0, gourmand: 0 },
    image: "/images/33_lavender-imported.png",
    thumb: "/hero/note-lavender.webp",
  },
  {
    id: "seasalt",
    name: "Atlantic Sea Salt",
    family: "Fresh",
    mood: "coastal breeze & mineral tide",
    origin: "Brittany, France",
    tier: "top",
    color: "#3fa7ba",
    accent: "#80deea",
    adj: "Azure",
    noun: "Tide",
    accords: { floral: 0, fresh: 90, woody: 10, oriental: 0, gourmand: 0 },
    image: "/images/27_vetiver-tonic-by-urban-virtue.jpeg",
    thumb: "/hero/note-seasalt.webp",
  },
  {
    id: "sandalwood",
    name: "Sudanese Sandalwood",
    family: "Woody",
    mood: "creamy timber & sacred warmth",
    origin: "Sudan",
    tier: "base",
    color: "#ba7b43",
    accent: "#ffcc80",
    adj: "Imperial",
    noun: "Sandal",
    accords: { floral: 0, fresh: 0, woody: 70, oriental: 20, gourmand: 10 },
    image: "/images/36_sandalwood-imported.png",
    thumb: "/hero/note-sandalwood.webp",
  },
  {
    id: "amber",
    name: "Gilded Amber",
    family: "Oriental",
    mood: "molten glow & balsamic warmth",
    origin: "Socotra Island",
    tier: "heart",
    color: "#c96218",
    accent: "#ffab91",
    adj: "Gilded",
    noun: "Amber",
    accords: { floral: 10, fresh: 0, woody: 20, oriental: 70, gourmand: 0 },
    image: "/images/08_amberwood-musk-by-urban-virtue.jpeg",
    thumb: "/hero/note-amber.webp",
  },
  {
    id: "vetiver",
    name: "Haitian Vetiver",
    family: "Earthy",
    mood: "verdant roots & petrichor rain",
    origin: "Les Cayes, Haiti",
    tier: "heart",
    color: "#547e3f",
    accent: "#a5d6a7",
    adj: "Verdant",
    noun: "Vetiver",
    accords: { floral: 0, fresh: 30, woody: 60, oriental: 10, gourmand: 0 },
    image: "/images/34_patchouli-imported.png",
    thumb: "/hero/note-vetiver.webp",
  },
];

export const SIZES = [
  { id: "30", label: "30 ml", volume: "1.0 FL. OZ.", name: "Travel Flacon", price: "$48.00", rawPrice: 48 },
  { id: "50", label: "50 ml", volume: "1.7 FL. OZ.", name: "Signature Flacon", price: "$85.00", rawPrice: 85 },
  { id: "100", label: "100 ml", volume: "3.4 FL. OZ.", name: "Millésime Grand", price: "$145.00", rawPrice: 145 },
];

export const MIN = 2;
export const MAX = 3;

export const INSCRIPTION_MAX = 24;
export const MAX_QTY = 10; // per formula in the bag

export type Note = (typeof NOTES)[number];
export type Size = (typeof SIZES)[number];

export function findNote(id: string): Note | undefined {
  return NOTES.find((n) => n.id === id);
}

export function findSize(id: string): Size | undefined {
  return SIZES.find((z) => z.id === id);
}

// "Velvet Rose", or the patron's inscription when they've written one
export function formulaName(notes: Note[], inscription?: string): string {
  const custom = inscription ? inscription.trim() : "";
  if (custom) return custom;
  if (!notes.length) return "Your Blend";
  return notes[0].adj + " " + notes[notes.length - 1].noun;
}

// Stable two-digit formula number derived from the note order
export function formulaNumber(notes: Note[]): string {
  let n = 0;
  notes.forEach((c) => {
    n = n * 7 + NOTES.indexOf(c) + 1;
  });
  n = (n % 97) + 1;
  return (n < 10 ? "0" : "") + n;
}

// The blended liquid colour: an even average of each note's colour
export function mixColor(notes: { color: string }[]): string {
  if (!notes.length) return "#c88a55";
  const sum = [0, 0, 0];
  notes.forEach((n) => {
    [1, 3, 5].forEach((at, i) => {
      sum[i] += parseInt(n.color.slice(at, at + 2), 16);
    });
  });
  return (
    "#" +
    sum
      .map((v) => {
        const s = Math.round(v / notes.length).toString(16);
        return s.length < 2 ? "0" + s : s;
      })
      .join("")
  );
}

// Note line printed on the flacon label, e.g. "Bergamot · Rose · Cambodian Oud"
export function labelNotes(notes: { name: string }[]): string {
  return notes
    .map((c) => c.name.replace("Calabrian ", "").replace("Bourbon ", "").replace("Taifi ", ""))
    .join(" · ");
}

export function formatPrice(dollars: number): string {
  return "$" + dollars.toFixed(2);
}

// Sample sealed blend shown in the shop's custom-studio hero and card (50 ml)
export const SAMPLE_BLEND: Note[] = ["rose", "amber", "oud"].map((id) => findNote(id)!);
