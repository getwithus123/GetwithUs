import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import SkipLink from "@/components/layout/SkipLink";
import SplashWrapper from "@/components/splash/SplashWrapper";
import Toast from "@/components/ui/Toast";
import { site } from "@/config/site";
import { publicEnv } from "@/config/public-env";
import { THEME_SCRIPT } from "@/lib/theme";
import "@/styles/globals.css";

/** Script running before paint to prevent first-frame content flash when splash will display */
const SPLASH_CHECK_SCRIPT = `(function(){try{var s=sessionStorage.getItem("gwu-splash");var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(!s&&!r){document.documentElement.classList.add("gwu-splash-active");}}catch(e){}})();`;

// Headings: Bricolage Grotesque, variable, with its optical-size axis.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-bricolage",
});

// Body and interface: Figtree, variable.
const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

// Code and terminals only, all well below the first screen: not preloaded, so it does
// not compete with the heading and body fonts (and no unused-preload warning).
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: software your business runs on`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // [OWNER: change lang if the primary language of the site is not English]
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${bricolage.variable} ${figtree.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Applies the stored theme before first paint (src/lib/theme.ts); the CSP allows inline scripts. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Prevents first-paint flash of content when splash plays */}
        <script dangerouslySetInnerHTML={{ __html: SPLASH_CHECK_SCRIPT }} />
      </head>
      <body>
        <SplashWrapper />
        <SkipLink />
        {children}
        <Toast />
        {publicEnv.gaId ? <GoogleAnalytics gaId={publicEnv.gaId} /> : null}
      </body>
    </html>
  );
}
