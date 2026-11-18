import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "./ProductCard";

export default function ProductCarousel({ products, badge }) {
  if (!products?.length) return null;

  return (
    <>
      <style>{`
        .naffy-product-swiper { padding: 0 2px 2.75rem; }
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
      `}</style>
      <Swiper
        className="naffy-product-swiper"
        modules={[Navigation]}
        navigation
        watchOverflow
        grabCursor
        spaceBetween={14}
        slidesPerView={2.12}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="!h-auto">
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
