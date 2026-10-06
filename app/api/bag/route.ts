import { BagFullError, addToBag, clearBag, getBagAndSyncCount, parseBlend } from "@/lib/bag";

// GET /api/bag: the patron's bag, priced from the catalog
export async function GET() {
  return Response.json(await getBagAndSyncCount());
}

// POST /api/bag { notes: string[], size: string, inscription?: string }: add a custom blend
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = parseBlend(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const { bag, itemId } = await addToBag(parsed.blend);
    return Response.json({ ...bag, itemId }, { status: 201 });
  } catch (err) {
    if (err instanceof BagFullError) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}

// DELETE /api/bag: empty the bag
export async function DELETE() {
  return Response.json(await clearBag());
}
