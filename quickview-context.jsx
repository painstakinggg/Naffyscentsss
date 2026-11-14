import React, { createContext, useContext, useState } from "react";
import QuickView from "@/components/product/QuickView";

const QuickViewContext = createContext(null);

export function QuickViewProvider({ children }) {
  const [product, setProduct] = useState(null);
  const open = (p) => setProduct(p);
  const close = () => setProduct(null);
  return (
    <QuickViewContext.Provider value={{ open, close }}>
      {children}
      <QuickView product={product} onClose={close} />
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  return ctx || { open: () => {}, close: () => {} };
}