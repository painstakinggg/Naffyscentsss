import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "./ProductCard";

export default function ProductCarousel({ products, badge }) {
  if (!products?.length) return null;

  // Repeat the curated set so the four-card homepage collections can loop
  // smoothly on desktop without changing each card's dimensions or spacing.
  const carouselProducts = Array.from({ length: 3 }, (_, cycle) =>
    products.map((product) => ({ product, key: `${product.id}-${cycle}` }))
  ).flat();

  return (
    <>
      <style>{`
        .naffy-product-swiper { padding: 0 2px 2.75rem; }
        .naffy-product-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
        .naffy-product-swiper .swiper-button-prev,
        .naffy-product-swiper .swiper-button-next {
          top: auto;
          bottom: 0;
          width: 32px;
          height: 32px;
          margin-top: 0;
          border: 1px solid rgba(197, 160, 89, .55);
          border-radius: 9999px;
          color: #C5A059;
          background: rgba(24, 20, 19, .72);
        }
        .naffy-product-swiper .swiper-button-prev { left: auto; right: 44px; }
        .naffy-product-swiper .swiper-button-next { right: 2px; }
        .naffy-product-swiper .swiper-button-prev::after,
        .naffy-product-swiper .swiper-button-next::after { font-size: 12px; font-weight: 700; }
        .naffy-product-swiper .swiper-button-disabled { opacity: .25; }
        @media (max-width: 639px) {
          .naffy-product-swiper .swiper-button-prev,
          .naffy-product-swiper .swiper-button-next { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .naffy-product-swiper .swiper-wrapper {
            transition-timing-function: ease !important;
          }
        }
      `}</style>
      <Swiper
        className="naffy-product-swiper"
        modules={[Autoplay, Navigation]}
        navigation
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={5000}
        loop
        loopAdditionalSlides={products.length}
        watchOverflow
        grabCursor
        spaceBetween={14}
        slidesPerView={2.12}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
        }}
      >
        {carouselProducts.map(({ product, key }) => (
          <SwiperSlide key={key} className="!h-auto">
            <ProductCard
              product={product}
              badge={typeof badge === "function" ? badge(product) : badge}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
