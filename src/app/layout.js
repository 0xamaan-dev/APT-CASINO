import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar.js";
import Footer from "@/components/Footer";
import GlobalWalletManager from "@/components/GlobalWalletManager";
import NetworkSwitcher from "@/components/NetworkSwitcher";
import GlobalNotificationSystem from "@/components/GlobalNotificationSystem";
import { PUBLIC_APP_ORIGIN_DEFAULT } from "@/config/externalLinks";


const inter = Inter({ subsets: ["latin"] });

const appOrigin = (
  process.env.NEXT_PUBLIC_APP_URL || PUBLIC_APP_ORIGIN_DEFAULT
).replace(/\/$/, "");

export const metadata = {
  metadataBase: new URL(`${appOrigin}/`),
  title: "APT Casino",
  description: "APT Casino",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link
          key="preload-clash-display"
          rel="preload"
          href="/fonts/ClashDisplay-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          key="preload-plus-jakarta"
          rel="preload"
          href="/fonts/PlusJakartaSans VariableFont.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body 
        className={`${inter.className} overflow-x-hidden w-full`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <GlobalWalletManager />
          <NetworkSwitcher />
          <GlobalNotificationSystem />
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

