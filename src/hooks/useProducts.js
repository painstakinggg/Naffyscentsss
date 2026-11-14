import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await base44.entities.Product.list("-created_date", 100);
        if (!active) return;
        let filtered = list || [];
        if (filters.featured) filtered = filtered.filter((p) => p.featured);
        if (filters.bestseller) filtered = filtered.filter((p) => p.bestseller);
        if (filters.category) filtered = filtered.filter((p) => p.category === filters.category);
        if (filters.available !== undefined) filtered = filtered.filter((p) => p.available === filters.available);
        if (filters.is_bundle !== undefined) filtered = filtered.filter((p) => !!p.is_bundle === !!filters.is_bundle);
        setProducts(filtered);
      } catch (e) {
        setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [JSON.stringify(filters)]);

  return { products, loading };
}