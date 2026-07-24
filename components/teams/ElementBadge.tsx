import Image from "next/image";
import { ELEMENT_LABELS, type PalElement } from "@/lib/teams/types";

type Props = {
  element: PalElement;
  size?: number;
  className?: string;
};

export function ElementBadge({ element, size = 18, className = "" }: Props) {
  const label = ELEMENT_LABELS[element];
  return (
    <span
      className={`el-badge el-badge--${element} ${className}`}
      style={{ width: size, height: size }}
      title={label}
    >
      <Image
        src={`/elements/${element}.png`}
        alt=""
        width={size}
        height={size}
        className="el-badge__img"
        sizes={`${size}px`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

type GroupProps = {
  elements: PalElement[];
  size?: number;
  className?: string;
};

export function ElementBadges({ elements, size = 18, className = "" }: GroupProps) {
  return (
    <span className={`el-badges ${className}`}>
      {elements.map((el) => (
        <ElementBadge key={el} element={el} size={size} />
      ))}
    </span>
  );
}
