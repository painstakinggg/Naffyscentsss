import React, { useEffect, useState } from "react";

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Unable to load products");
        const data = await response.json();
        if (!active) return;

        let filtered = Array.isArray(data.products) ? data.products : [];
        if (filters.featured) filtered = filtered.filter((product) => product.featured);
        if (filters.bestseller) filtered = filtered.filter((product) => product.bestseller);
        if (filters.category) filtered = filtered.filter((product) => product.category === filters.category);
        if (filters.available !== undefined) {
          filtered = filtered.filter((product) => product.available === filters.available);
        }
        if (filters.is_bundle !== undefined) {
          filtered = filtered.filter((product) => Boolean(product.is_bundle) === Boolean(filters.is_bundle));
        }

        setProducts(filtered);
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [JSON.stringify(filters)]);

  return { products, loading };
}
