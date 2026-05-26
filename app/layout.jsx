import { DM_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// DM Mono only ships 300/400/500 on Google Fonts (no 600/700) — requesting an
// unavailable weight would fail the build, so we load its real weights. The
// component's inline `fontWeight:600/700` falls back to 500, exactly as in v5.
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "SGX Trade Journal",
  description: "SGX equities orderflow session board",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SGX Journal",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f0a500",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmMono.variable} ${ibmPlexSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
