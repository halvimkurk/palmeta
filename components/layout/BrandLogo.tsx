import Image from "next/image";

/** ThePaldex wordmark — gold THE + Palworld-style PALDEX. */
type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: "(max-width: 900px) 7.5rem, 9.5rem",
  md: "10rem",
  lg: "(max-width: 720px) min(18rem, 72vw), 20rem",
} as const;

export function BrandLogo({ className = "", size = "md" }: Props) {
  return (
    <span
      className={`brand-logo brand-logo--${size} ${className}`}
      aria-label="ThePaldex"
    >
      <Image
        className="brand-logo__mark"
        src="/brand/paldex-logo.webp"
        alt=""
        width={1198}
        height={409}
        sizes={SIZES[size]}
        priority={size === "lg"}
      />
    </span>
  );
}
