import type { FaqItem } from "@/lib/seo/faqs";

type Props = {
  title?: string;
  items: FaqItem[];
};

/** Indexable FAQ block for tool hubs (pairs with FAQPage JSON-LD). */
export function SeoFaq({ title = "FAQ", items }: Props) {
  return (
    <section className="seo-faq" aria-labelledby="seo-faq-title">
      <h2 id="seo-faq-title" className="seo-faq__title">
        {title}
      </h2>
      <div className="seo-faq__list">
        {items.map((item) => (
          <details key={item.q} className="seo-faq__item">
            <summary className="seo-faq__question">{item.q}</summary>
            <p className="seo-faq__answer">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
