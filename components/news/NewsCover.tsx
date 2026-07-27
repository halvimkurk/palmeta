import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

export function NewsCover({ src, alt, priority = false, className = "" }: Props) {
  return (
    <div className={`news-cover ${className}`.trim()}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 719px) 100vw, 50vw"
        className="news-cover__img"
        priority={priority}
      />
    </div>
  );
}
