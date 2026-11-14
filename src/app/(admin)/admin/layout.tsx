import type { Metadata } from "next";
import ForceDarkTheme from "@/components/admin/ForceDarkTheme";

/** The admin area is for the team only: never indexed, never followed. */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The admin is always dark (docs/design.md, Theme). Analytics never loads here,
 * but a team member can arrive from the public site in the same tab (Back, or a
 * link), where it is already running: "ph-no-capture" keeps leads out of any
 * session recording and click capture. `contents` leaves the layout as it was.
 */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <ForceDarkTheme />
      <div className="ph-no-capture contents">{children}</div>
    </>
  );
}
