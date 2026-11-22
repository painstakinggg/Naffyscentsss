// Brand imagery — generated luxury visuals for Naffy Scents
// Base44-hosted assets have been migrated to the site's Cloudflare R2 media route.
export const IMAGES = {
  hero: "https://i.ibb.co/j97MJYPV/IMG-20260926-WA0010.jpg",
  productGold: "/api/media/product-gold-render.jpg",
  productAmber: "/api/media/product-amber-render.jpg",
  productSmoky: "/api/media/product-smoky-render.jpg",
  productMidnight: "/api/media/product-midnight-render.jpg",
  productFrosted: "/api/media/product-frosted-render.jpg",
  productEmerald: "/api/media/product-emerald-render.jpg",
  productOnyx: "/api/media/product-onyx-render.jpg",
  brandStory: "https://i.ibb.co/4ndT4DX9/IMG-20260926-WA0008.jpg",
  promoBanner: "/api/media/promo-banner-render.jpg",
  categoryHer: "/api/media/category-her-render.jpg",
  categoryHim: "/api/media/category-him-render.jpg",
};

export const formatNaira = (amount) => {
  if (amount == null || isNaN(amount)) return "₦0";
  return "₦" + Number(amount).toLocaleString("en-NG", { maximumFractionDigits: 0 });
};
