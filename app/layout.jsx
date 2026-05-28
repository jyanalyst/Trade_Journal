import { DM_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { IdeasProvider } from "../lib/IdeasContext";
import BottomNav from "../components/BottomNav";
import EditPanelWrapper from "../components/EditPanelWrapper";

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
      <body>
        <IdeasProvider>
          <main style={{ paddingBottom: 60 }}>
            {children}
          </main>
          <EditPanelWrapper />
          <BottomNav />
        </IdeasProvider>
      </body>
    </html>
  );
}
