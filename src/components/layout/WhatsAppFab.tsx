import { MessageCircle } from "lucide-react";
import TrackedLink from "@/components/layout/TrackedLink";
import Icon from "@/components/ui/Icon";
import { known, site } from "@/config/site";
import { cn } from "@/lib/cn";

// WhatsApp green that carries white text at 5:1 in both themes (the --wa token lightens in dark for icons).
const SHAPE =
  "wa-fab flex h-14 items-center gap-2.5 rounded-full bg-[#15803d] pr-5 pl-4 font-bold text-white shadow-lift max-[600px]:w-14 max-[600px]:justify-center max-[600px]:p-0";

/**
 * The floating WhatsApp button, bottom right above the safe area. Shown only
 * once the owner's phone number is known; icon-only below 600 px. `preview`
 * draws the same button in place, not linked, for the design kit.
 */
export default function WhatsAppFab({ preview = false }: { preview?: boolean }) {
  const content = (
    <>
      <Icon icon={MessageCircle} size={24} />
      <span className="max-[600px]:sr-only">Chat with us</span>
    </>
  );
  if (preview) return <span className={cn(SHAPE, "relative w-fit")}>{content}</span>;

  const digits = known(site.contact.phone)?.replace(/\D/g, "");
  if (!digits) return null;
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(site.whatsAppMessage)}`;
  return (
    <TrackedLink
      kind="whatsapp"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        SHAPE,
        "fixed right-5 bottom-[calc(20px+env(safe-area-inset-bottom,0px))] z-50",
      )}
    >
      {content}
    </TrackedLink>
  );
}
