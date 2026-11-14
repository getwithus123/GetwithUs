import Analytics from "@/components/analytics/Analytics";
import UtmCapture from "@/components/forms/UtmCapture";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import WhatsAppFab from "@/components/layout/WhatsAppFab";

/**
 * Every marketing page is fully static: built from src/content and src/config only.
 * `navigation` makes the build fail if any page in this group reads request data.
 */
export const ensureStatic = "navigation";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main id="content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <WhatsAppFab />
      <UtmCapture />
      <Analytics />
    </>
  );
}
