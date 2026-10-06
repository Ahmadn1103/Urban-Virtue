// Shop filters as they appear in the URL (?category=…&q=…&sort=…), shared by server and client
export type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export const SORTS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "Name: A to Z" },
];

export type ShopQuery = { category: string; q: string; sort: SortKey };

export const DEFAULT_QUERY: ShopQuery = { category: "", q: "", sort: "featured" };

function isSortKey(s: unknown): s is SortKey {
  return SORTS.some((x) => x.id === s);
}

export function parseShopQuery(search: string, categoryIds: string[]): ShopQuery {
  const sp = new URLSearchParams(search);
  const category = sp.get("category") ?? "";
  const sort = sp.get("sort");
  return {
    category: categoryIds.includes(category) ? category : "",
    q: (sp.get("q") ?? "").slice(0, 80),
    sort: isSortKey(sort) ? sort : "featured",
  };
}

export function shopQueryString(q: ShopQuery): string {
  const sp = new URLSearchParams();
  if (q.category) sp.set("category", q.category);
  if (q.q.trim()) sp.set("q", q.q.trim());
  if (q.sort !== "featured") sp.set("sort", q.sort);
  return sp.toString();
}
