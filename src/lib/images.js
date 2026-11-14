// Brand imagery — generated luxury visuals for Naffy Scents
export const IMAGES = {
  hero: "https://i.ibb.co/j97MJYPV/IMG-20260926-WA0010.jpg",
  productGold: "https://media.base44.com/images/public/6aa9c58b774c337069ac009e/1d6c21cbe_generated_d2f0b046.jpg",
  productAmber: "https://media.base44.com/images/public/6aa9c58b774c337069ac009e/28e09ec08_generated_b9f7b5d9.jpg",
  productSmoky: "https://media.base44.com/images/public/6aa9c58b774c337069ac009e/b27323637_generated_91018e89.jpg",
  productMidnight: "https://media.base44.com/images/public/6aa9c58b774c337069ac009e/e7ebf7b51_generated_27c84dc5.jpg",
  productFrosted: "https://media.base44.com/images/public/6aa9c58b774c337069ac009e/a6ee156c7_generated_d831ef2a.jpg",
  productEmerald: "https://media.base44.com/images/public/6aa9c58b774c337069ac009e/6b3c5f302_generated_dd1ea586.jpg",
  productOnyx: "https://media.base44.com/images/public/6aa9c58b774c337069ac009e/0aa752b54_generated_cfbb4005.jpg",
  brandStory: "https://i.ibb.co/4ndT4DX9/IMG-20260926-WA0008.jpg",
  promoBanner: "https://media.base44.com/images/public/6aa9c58b774c337069ac009e/dc909824f_generated_9f9744c9.jpg",
  categoryHer: "https://media.base44.com/images/public/6aa9c58b774c337069ac009e/b2a894127_generated_c38af86f.jpg",
  categoryHim: "https://media.base44.com/images/public/6aa9c58b774c337069ac009e/562abedd6_generated_485429e2.jpg",
};

export const formatNaira = (amount) => {
  if (amount == null || isNaN(amount)) return "₦0";
  return "₦" + Number(amount).toLocaleString("en-NG", { maximumFractionDigits: 0 });
};