import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { InstagramIcon } from "@/components/icons/BrandIcons";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import TrackedLink from "@/components/layout/TrackedLink";
import { known, site } from "@/config/site";
import { contactPage } from "@/content/pages";
import { siteContent } from "@/content/site";

type Detail = { label: string; icon: ReactNode; value: ReactNode };

/** "@handle" from a profile URL such as https://www.instagram.com/handle/. */
function handle(url: string): string {
  const last = new URL(url).pathname.split("/").filter(Boolean).pop();
  return last ? `@${last}` : url;
}

/** The contact facts the owner has filled in, with nothing shown for the rest. */
function details(): Detail[] {
  const email = known(site.contact.email);
  const phone = known(site.contact.phone);
  const address = known(site.contact.address);
  const city = known(site.contact.city);
  const instagram = siteContent.social.instagram;
  const list: Detail[] = [];
  if (email) {
    list.push({
      label: "Email",
      icon: <Icon icon={Mail} size={20} />,
      value: (
        <TrackedLink kind="email" href={`mailto:${email}`} className="text-ink transition-colors hover:text-accent">
          {email}
        </TrackedLink>
      ),
    });
  }
  if (phone) {
    list.push({ label: "Phone or WhatsApp", icon: <Icon icon={Phone} size={20} />, value: phone });
  }
  if (instagram) {
    list.push({
      label: "Instagram",
      icon: <InstagramIcon className="size-5" />,
      value: (
        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink transition-colors hover:text-accent"
        >
          {handle(instagram)}
        </a>
      ),
    });
  }
  // A street address is an office; until there is one, the city is where the team is based.
  if (address) {
    list.push({ label: "Office", icon: <Icon icon={MapPin} size={20} />, value: address });
  } else if (city) {
    list.push({ label: "Based in", icon: <Icon icon={MapPin} size={20} />, value: city });
  }
  return list;
}

/** True when there is anything to show: a known contact fact or the scheduling link. */
export function hasContactDetails(showBooking = false): boolean {
  return details().length > 0 || (showBooking && Boolean(site.schedulingUrl));
}

/** Email, phone and WhatsApp, Instagram, and office or city, each only once known; and "Book a call" when the scheduling link is set. */
export default function ContactDetails({ showBooking = false }: { showBooking?: boolean }) {
  return (
    <address className="grid gap-5 not-italic">
      {details().map((detail) => (
        <div key={detail.label} className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-accent-soft text-accent">
            {detail.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-muted">{detail.label}</p>
            <p className="text-ink">{detail.value}</p>
          </div>
        </div>
      ))}
      {showBooking && site.schedulingUrl ? (
        <div>
          <Button
            href={site.schedulingUrl}
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon={CalendarDays} size={16} />
            {contactPage.bookCall}
          </Button>
        </div>
      ) : null}
    </address>
  );
}
