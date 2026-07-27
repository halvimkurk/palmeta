import Image from "next/image";

/** Paldex wordmark in Palworld logo style. */
type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: "(max-width: 900px) 6.5rem, 8.5rem",
  md: "8.5rem",
  lg: "(max-width: 720px) min(16rem, 68vw), 18rem",
} as const;

export function BrandLogo({ className = "", size = "md" }: Props) {
  return (
    <span
      className={`brand-logo brand-logo--${size} ${className}`}
      aria-label="Paldex"
    >
      <Image
        className="brand-logo__mark"
        src="/brand/paldex-logo.webp"
        alt=""
        width={1181}
        height={425}
        sizes={SIZES[size]}
        priority={size === "lg"}
      />
    </span>
  );
}
