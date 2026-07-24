import { ELEMENT_LABELS, type PalElement } from "@/lib/teams/types";

type Props = {
  elements: PalElement[];
  /** show text labels next to dots */
  labeled?: boolean;
  className?: string;
};

export function ElementDots({ elements, labeled = false, className = "" }: Props) {
  return (
    <span className={`el-dots ${labeled ? "el-dots--labeled" : ""} ${className}`}>
      {elements.map((el) => (
        <span key={el} className={`el-dot el-${el}`} title={ELEMENT_LABELS[el]}>
          {labeled ? <span className="el-dot__label">{ELEMENT_LABELS[el]}</span> : null}
        </span>
      ))}
    </span>
  );
}
