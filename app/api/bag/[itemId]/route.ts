import { MAX_QTY, parseQty, removeFromBag, setQuantity } from "@/lib/bag";

const notFound = () => Response.json({ error: "That item is no longer in your bag." }, { status: 404 });

// PATCH /api/bag/:itemId { qty: number }: change a line's quantity
export async function PATCH(request: Request, ctx: RouteContext<"/api/bag/[itemId]">) {
  const { itemId } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const qty = parseQty(body);
  if (qty === null) {
    return Response.json({ error: `Quantity must be between 1 and ${MAX_QTY}.` }, { status: 400 });
  }

  const bag = await setQuantity(itemId, qty);
  return bag ? Response.json(bag) : notFound();
}

// DELETE /api/bag/:itemId: remove a line
export async function DELETE(_request: Request, ctx: RouteContext<"/api/bag/[itemId]">) {
  const { itemId } = await ctx.params;
  const bag = await removeFromBag(itemId);
  return bag ? Response.json(bag) : notFound();
}
