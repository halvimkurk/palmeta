import Image from "next/image";
import Link from "next/link";
import type { GuideBlock, GuideTool } from "@/lib/guides/types";

const TOOL_CLASS: Record<GuideTool, string> = {
  breeding: "guide-tool-cta--breeding",
  tiers: "guide-tool-cta--tiers",
  teams: "guide-tool-cta--teams",
  pals: "guide-tool-cta--pals",
  map: "guide-tool-cta--map",
};

function blockKey(block: GuideBlock, index: number) {
  if (block.type === "h2") return `h2-${block.id ?? block.text}-${index}`;
  if (block.type === "toolCta") return `cta-${block.href}-${index}`;
  if (block.type === "image") return `img-${block.src}-${index}`;
  return `${block.type}-${index}`;
}

function sectionNumber(n: number) {
  return String(n).padStart(2, "0");
}

export function GuideBody({ blocks }: { blocks: GuideBlock[] }) {
  let sectionIndex = 0;

  return (
    <div className="guide-body">
      {blocks.map((block, index) => {
        const key = blockKey(block, index);

        switch (block.type) {
          case "tldr":
            return (
              <aside key={key} className="guide-tldr" aria-label="TL;DR">
                <p className="guide-tldr__label">TL;DR</p>
                <ul>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </aside>
            );
          case "p":
            return (
              <p key={key} className="guide-body__p">
                {block.text}
              </p>
            );
          case "h2": {
            sectionIndex += 1;
            return (
              <h2 key={key} id={block.id} className="guide-body__h2">
                <span className="guide-body__h2-num" aria-hidden="true">
                  {sectionNumber(sectionIndex)}
                </span>
                <span className="guide-body__h2-text">{block.text}</span>
              </h2>
            );
          }
          case "ul":
            return (
              <ul key={key} className="guide-body__list">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="guide-body__list guide-body__list--ol">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            );
          case "callout":
            return (
              <aside
                key={key}
                className={`guide-callout guide-callout--${block.kind}`}
              >
                {block.title ? (
                  <p className="guide-callout__title">{block.title}</p>
                ) : null}
                <p className="guide-callout__text">{block.text}</p>
              </aside>
            );
          case "table":
            return (
              <div key={key} className="guide-table-wrap">
                {block.caption ? (
                  <p className="guide-table__caption">{block.caption}</p>
                ) : null}
                <table className="guide-table">
                  <thead>
                    <tr>
                      {block.headers.map((header) => (
                        <th key={header} scope="col">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row) => (
                      <tr key={row.join("|")}>
                        {row.map((cell) => (
                          <td key={cell}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "image": {
            const isSvg = block.src.endsWith(".svg");
            // Schematics are wide (~10:3); photos stay 16:9.
            const width = isSvg ? 800 : 1200;
            const height = isSvg ? 240 : 675;
            return (
              <figure key={key} className="guide-figure">
                <div className="guide-figure__frame">
                  {isSvg ? (
                    // eslint-disable-next-line @next/next/no-img-element -- schematic SVGs skip the image optimizer
                    <img
                      src={block.src}
                      alt={block.alt}
                      className="guide-figure__img guide-figure__img--schematic"
                      width={width}
                      height={height}
                    />
                  ) : (
                    <Image
                      src={block.src}
                      alt={block.alt}
                      width={width}
                      height={height}
                      className="guide-figure__img"
                      sizes="(max-width: 800px) 100vw, 720px"
                    />
                  )}
                </div>
                {block.caption ? (
                  <figcaption className="guide-figure__caption">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          }
          case "toolCta":
            return (
              <Link
                key={key}
                href={block.href}
                className={`guide-tool-cta ${TOOL_CLASS[block.tool]}`}
              >
                <span className="guide-tool-cta__label">{block.label}</span>
                {block.hint ? (
                  <span className="guide-tool-cta__hint">{block.hint}</span>
                ) : null}
              </Link>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
