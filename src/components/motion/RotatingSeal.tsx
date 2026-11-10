import OnScreen from "@/components/motion/OnScreen";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

/**
 * A round seal whose text turns slowly on a circular path around the brand mark.
 * Decorative; the same promise is written in the page copy. Still under
 * reduced motion and while off screen.
 */
export default function RotatingSeal({
  // Accounts, not code: the code becomes the client's once the project is paid for (the Terms).
  // Keep the length at 36 characters so the words stay evenly spaced around the circle.
  text = "shipped weekly · in your accounts · ",
  id = "seal-path",
  className,
}: {
  text?: string;
  id?: string;
  className?: string;
}) {
  return (
    <OnScreen aria-hidden className={cn("rotating-seal", className)}>
      <svg viewBox="0 0 130 130" className="rotating-seal-text" focusable="false">
        <defs>
          <path id={id} d="M65,65 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
        </defs>
        <text>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      <span className="rotating-seal-core">
        <LogoMark />
      </span>
    </OnScreen>
  );
}
