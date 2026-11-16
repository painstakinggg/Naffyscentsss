import React from "react";
import Reveal from "@/components/ui/Reveal";
import { Link } from "react-router-dom";

const CONTENT = {
  faq: {
    title: "Frequently Asked Questions",
    sections: [
      { q: "How long do Naffy Scents fragrances last?", a: "Our fragrances are crafted for longevity. Depending on the composition and your skin chemistry, expect 6–10 hours of wear, with base notes lingering even longer." },
      { q: "Are your fragrances authentic?", a: "Every Naffy Scents fragrance is an original composition, crafted and bottled by us. We guarantee authenticity and quality on every order." },
      { q: "How long does delivery take?", a: "Lagos deliveries arrive within 1–2 business days. Nationwide delivery takes 2–5 business days depending on your location." },
      { q: "What is your return policy?", a: "Unopened fragrances in their original packaging can be returned within 7 days of delivery. See our Returns & Refunds page for full details." },
      { q: "Do you offer recommendations?", a: "Yes. Use our Fragrance Finder on the homepage, or message us on WhatsApp and our scent experts will help you find your signature scent." },
      { q: "Can I order via WhatsApp?", a: "Absolutely. Use the WhatsApp button on any page to chat with us and place an order directly." },
    ],
  },
  shipping: {
    title: "Shipping & Delivery",
    paragraphs: [
      "We deliver within Ilaro, Ogun State, and offer free pickup from our store.",
      "Delivery within Ilaro is ₦1,000 – ₦2,000 via Josh Logistics. The exact delivery charge is confirmed with you after your order is placed.",
      "Prefer to pick up? Choose Pickup at checkout and collect from our Ilaro store during pickup hours (12:00 PM – 5:00 PM) at no delivery cost.",
      "You will receive a confirmation message with your order details, and a follow-up call to confirm delivery and payment.",
      "For order tracking, please contact us via WhatsApp with your order reference number.",
    ],
  },
  returns: {
    title: "Returns & Refunds",
    paragraphs: [
      "Your satisfaction is important to us. If you are not completely satisfied with your purchase, we accept returns under the following conditions.",
      "Unopened fragrances in their original packaging may be returned within 7 days of delivery for a full refund.",
      "Opened or used fragrances cannot be returned due to hygiene and safety reasons, unless the product arrived damaged or defective.",
      "If your order arrived damaged, please contact us via WhatsApp within 48 hours with a photo of the damaged item for a replacement or refund.",
      "Refunds are processed within 5–7 business days to your original payment method.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    paragraphs: [
      "Naffy Scents respects your privacy and is committed to protecting your personal information.",
      "We collect information you provide when placing an order, creating an account, or contacting us — including your name, email, phone number, and delivery address.",
      "We use your information solely to process orders, deliver products, and communicate with you about your purchases and our offerings.",
      "We do not sell or share your personal information with third parties except as necessary to fulfil your order (e.g. delivery partners).",
      "You may request access to, correction of, or deletion of your personal data at any time by contacting us.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    paragraphs: [
      "By using the Naffy Scents website and placing an order, you agree to these terms and conditions.",
      "All orders are subject to availability. We reserve the right to refuse or cancel any order at our discretion.",
      "Prices are listed in Nigerian Naira (₦) and are subject to change without notice. Delivery fees are calculated at checkout.",
      "Payment is required at the time of order placement. We currently accept payment on delivery and bank transfer.",
      "All content on this website, including images, text, and branding, is the property of Naffy Scents and may not be reproduced without permission.",
    ],
  },
};

export default function InfoPage({ page }) {
  const content = CONTENT[page] || CONTENT.faq;

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <Reveal className="text-center mb-14">
          <p className="text-[11px] tracking-luxe text-gold uppercase mb-4">Naffy Scents</p>
          <h1 className="font-heading text-4xl sm:text-5xl text-cream">{content.title}</h1>
          <div className="luxury-line w-24 mx-auto mt-6" />
        </Reveal>

        {content.sections ? (
          <div className="space-y-3">
            {content.sections.map((s, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <details className="glass rounded-xl group">
                  <summary className="cursor-pointer p-5 flex items-center justify-between list-none">
                    <span className="font-heading text-lg text-cream">{s.q}</span>
                    <span className="text-gold text-xl transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-cream/55 leading-relaxed">{s.a}</div>
                </details>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="space-y-5">
              {content.paragraphs.map((p, i) => (
                <p key={i} className="text-cream/60 leading-relaxed">{p}</p>
              ))}
            </div>
          </Reveal>
        )}

        <div className="text-center mt-14">
          <Link to="/contact" className="btn-outline-gold inline-block px-8 py-3">Still have questions? Contact us</Link>
        </div>
      </div>
    </div>
  );
}