type FaqItem = { q: string; a: string };

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
      <dl className="seo-faq__list">
        {items.map((item) => (
          <div key={item.q} className="seo-faq__item">
            <dt>{item.q}</dt>
            <dd>{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
