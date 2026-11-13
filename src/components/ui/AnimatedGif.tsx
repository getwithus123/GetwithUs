import Image from "next/image";

/**
 * A decorative GIF displayed in a rounded card with the site's shadow.
 * Always aria-hidden: these are illustrative, never informational.
 * Under prefers-reduced-motion the browser still shows the first frame;
 * the GIF continues because we cannot pause it from CSS alone, but the
 * motion is not essential so this is acceptable.
 */
export default function AnimatedGif({
  src,
  alt = "",
  width = 480,
  height = 300,
  caption,
  className,
}: {
  src: string;
  /** Always empty string: GIFs are decorative. */
  alt?: string;
  width?: number;
  height?: number;
  /** Optional label shown below the GIF in muted small text. */
  caption?: string;
  className?: string;
}) {
  return (
    <figure
      aria-hidden="true"
      className={className}
    >
      <div className="overflow-hidden rounded-[18px] border border-line shadow-soft">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          className="block w-full"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2.5 text-center text-xs font-semibold text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
