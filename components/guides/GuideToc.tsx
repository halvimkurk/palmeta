"use client";

import { useEffect, useState } from "react";

type Section = {
  id: string;
  text: string;
};

type Props = {
  sections: Section[];
};

export function GuideToc({ sections }: Props) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (!sections.length) return;

    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
          return;
        }

        // If nothing is intersecting near the top, pick the last section above the fold.
        const above = nodes
          .filter((node) => node.getBoundingClientRect().top <= 140)
          .at(-1);
        if (above) setActiveId(above.id);
      },
      {
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0, 0.25, 1],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  if (!sections.length) return null;

  return (
    <aside className="guide-toc">
      <p className="guide-toc__title">On this page</p>
      <nav aria-label="Guide sections">
        {sections.map((section, index) => {
          const active = section.id === activeId;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={active ? "is-active" : undefined}
              aria-current={active ? "location" : undefined}
            >
              <span className="guide-toc__num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="guide-toc__label">{section.text}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
