import Image from "next/image";

/** Official Palworld wordmark with “Meta” beside it. */
type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
};

const SIZES = {
  sm: "(max-width: 900px) 7.25rem, 9.5rem",
  md: "9.5rem",
  lg: "(max-width: 720px) min(18rem, 70vw), 20rem",
} as const;

export function BrandLogo({
  className = "",
  size = "md",
  showWordmark = true,
}: Props) {
  return (
    <span
      className={`brand-logo brand-logo--${size} ${className}`}
      aria-label="Palworld Meta"
    >
      <Image
        className="brand-logo__mark"
        src="/brand/palworld-logo.webp"
        alt=""
        width={596}
        height={164}
        sizes={SIZES[size]}
        priority={size === "lg"}
      />
      {showWordmark ? (
        <span className="brand-logo__meta" aria-hidden>
          Meta
        </span>
      ) : null}
    </span>
  );
}
