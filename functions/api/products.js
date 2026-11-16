const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=60, s-maxage=60",
  },
});

const parseArray = (value) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return json({ error: "Product database is unavailable" }, 503);
  }

  try {
    const result = await env.DB.prepare(
      `SELECT id, name, slug, short_description, description, price,
              compare_at_price, category, gender, fragrance_family,
              top_notes, heart_notes, base_notes, size_ml, images, stock,
              featured, bestseller, rating, review_count, occasions,
              intensity, moods, available, is_bundle, bundle_items,
              created_at, updated_at
       FROM products
       WHERE available = 1
       ORDER BY created_at DESC, name ASC`
    ).all();

    const products = (result.results || []).map((product) => ({
      ...product,
      images: parseArray(product.images),
      occasions: parseArray(product.occasions),
      moods: parseArray(product.moods),
      bundle_items: parseArray(product.bundle_items),
      featured: Boolean(product.featured),
      bestseller: Boolean(product.bestseller),
      available: Boolean(product.available),
      is_bundle: Boolean(product.is_bundle),
    }));

    return json({ products, total: products.length });
  } catch (error) {
    return json({
      error: "Unable to load products",
      detail: error instanceof Error ? error.message : "Unknown database error",
    }, 500);
  }
}
