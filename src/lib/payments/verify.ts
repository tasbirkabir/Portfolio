import { db } from "@/lib/db";

/**
 * Verify item prices from the database — never trust client-sent prices.
 * Returns the verified items with DB prices, or null if any item is not found.
 */
export async function verifyItemPrices(
  items: { slug: string; title: string; type: "book" | "resource"; price: number }[]
): Promise<{ slug: string; title: string; type: string; price: number }[] | null> {
  const verified: { slug: string; title: string; type: string; price: number }[] = [];

  for (const it of items) {
    const dbItem = it.type === "book"
      ? await db.book.findUnique({ where: { slug: it.slug }, select: { slug: true, title: true, price: true } })
      : await db.resource.findUnique({ where: { slug: it.slug }, select: { slug: true, title: true, price: true } });

    if (!dbItem) return null;

    verified.push({
      slug: dbItem.slug,
      title: dbItem.title,
      type: it.type,
      price: Number(dbItem.price), // ALWAYS use DB price
    });
  }

  return verified;
}

/** Check for duplicate purchases — returns items the user doesn't already own. */
export async function filterAlreadyOwned(
  userEmail: string,
  items: { slug: string; type: string }[]
): Promise<{ slug: string; type: string }[]> {
  const result: { slug: string; type: string }[] = [];
  for (const it of items) {
    const existing = await db.libraryAccess.findFirst({
      where: { userEmail, itemType: it.type, itemSlug: it.slug },
    });
    if (!existing) result.push(it);
  }
  return result;
}
