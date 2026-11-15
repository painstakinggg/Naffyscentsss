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

const normalizeProduct = (product) => ({
  ...product,
  images: parseArray(product.images),
  occasions: parseArray(product.occasions),
  moods: parseArray(product.moods),
  bundle_items: parseArray(product.bundle_items),
  featured: Boolean(product.featured),
  bestseller: Boolean(product.bestseller),
  available: Boolean(product.available),
  is_bundle: Boolean(product.is_bundle),
});

const PRODUCT_FIELDS = `
  id, name, slug, short_description, description, price,
  compare_at_price, category, gender, fragrance_family,
  top_notes, heart_notes, base_notes, size_ml, images, stock,
  featured, bestseller, rating, review_count, occasions,
  intensity, moods, available, is_bundle, bundle_items,
  created_at, updated_at
`;

export async function onRequestGet({ request, env, params }) {
  if (!env.DB) {
    return json({ error: "Product database is unavailable" }, 503);
  }

  const identifier = String(params.id || "").trim();
  if (!identifier) return json({ error: "Product not found" }, 404);

  try {
    const product = await env.DB.prepare(
      `SELECT ${PRODUCT_FIELDS} FROM products
       WHERE id = ? OR slug = ?
       LIMIT 1`
    ).bind(identifier, identifier).first();

    if (!product) return json({ error: "Product not found" }, 404);

    const [relatedResult, reviewResult] = await Promise.all([
      env.DB.prepare(
        `SELECT ${PRODUCT_FIELDS} FROM products
         WHERE category = ? AND id != ? AND available = 1
         ORDER BY featured DESC, created_at DESC
         LIMIT 4`
      ).bind(product.category, product.id).all(),
      env.DB.prepare(
        `SELECT id, product_id, customer_name, rating, review,
                verified, created_at
         FROM reviews
         WHERE product_id = ? AND (approved = 1 OR status = 'Approved')
         ORDER BY created_at DESC
         LIMIT 50`
      ).bind(product.id).all(),
    ]);

    return json({
      product: normalizeProduct(product),
      related: (relatedResult.results || []).map(normalizeProduct),
      reviews: reviewResult.results || [],
    });
  } catch (error) {
    return json({
      error: "Unable to load product details",
      detail: error instanceof Error ? error.message : "Unknown database error",
    }, 500);
  }
}
