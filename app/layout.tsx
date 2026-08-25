import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import { SITE } from "./site";
import "./globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

// The tab and the home screen say Mr. Faaja; the page itself, the wordmark and
// the CV all still say the name a recruiter is searching for.
const TITLE = "Mr. Faaja";
const NAME = "Ibrahim Uthman";
const DESCRIPTION = "ServiceNow Developer. Problem solver. Always learning.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: NAME,
    title: NAME,
    description: DESCRIPTION,
    locale: "en_GB",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Ibrahim Khalil Uthman, ServiceNow Developer" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@IbdotBoss",
    creator: "@IbdotBoss",
    title: NAME,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  // The header is the only fixed element and it is a solid bar, so covering the
  // notch is safe as long as its padding uses the insets. See globals.css.
  viewportFit: "cover",
  themeColor: "#081426",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={lato.variable}>
      <body>{children}</body>
    </html>
  );
}
