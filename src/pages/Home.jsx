import React from "react";
import Hero from "@/components/home/Hero";
import SignatureCollection from "@/components/home/SignatureCollection";
import Categories from "@/components/home/Categories";
import BestSellers from "@/components/home/BestSellers";
import Bundles from "@/components/home/Bundles";
import BrandStory from "@/components/home/BrandStory";
import WhyNaffy from "@/components/home/WhyNaffy";
import FragranceFinder from "@/components/home/FragranceFinder";
import PromoBanner from "@/components/home/PromoBanner";
import Testimonials from "@/components/home/Testimonials";
import SocialGrid from "@/components/home/SocialGrid";
import Newsletter from "@/components/home/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <SignatureCollection />
      <Categories />
      <BestSellers />
      <Bundles />
      <BrandStory />
      <WhyNaffy />
      <FragranceFinder />
      <PromoBanner />
      <Testimonials />
      <SocialGrid />
      <Newsletter />
    </>
  );
}