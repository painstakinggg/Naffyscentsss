import React from "react";
import Hero from "@/components/home/Hero";
import NewArrivals from "@/components/home/NewArrivals";
import BestSellers from "@/components/home/BestSellers";
import SignatureCollection from "@/components/home/SignatureCollection";
import Categories from "@/components/home/Categories";
import Bundles from "@/components/home/Bundles";
import FragranceFinder from "@/components/home/FragranceFinder";
import PromoBanner from "@/components/home/PromoBanner";
import WhyNaffy from "@/components/home/WhyNaffy";
import Newsletter from "@/components/home/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <BestSellers />
      <SignatureCollection />
      <Categories />
      <Bundles />
      <FragranceFinder />
      <PromoBanner />
      <WhyNaffy />
      <Newsletter />
    </>
  );
}
