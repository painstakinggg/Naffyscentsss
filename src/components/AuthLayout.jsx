import React from "react";
import { Image } from "@/components/ui/image";

const LOGO_URL = "/favicon.svg";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image src={LOGO_URL} alt="Naffy Scents" fittingType="fit" className="h-12 w-auto object-contain" />
            <span className="font-heading font-semibold tracking-luxe-sm text-cream text-2xl leading-none whitespace-nowrap">NAFFY SCENTS</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}