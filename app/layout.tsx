import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "./util/auth";
import { BalanceProvider } from "./hooks/useBalance";
import Provider from "./components/wrapper/Provider";
import DynamicNavBarWrapper from "./components/wrapper/DynamicNavBarWrapper";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'DeTube - Decentralized Video Platform',
    template: '%s | DeTube'
  },
  description: 'Watch and share videos on DeTube, the decentralized video streaming platform',
  keywords: ['decentralized video', 'blockchain video', 'web3 streaming', 'DeTube'],
  metadataBase: new URL('https://detube.slope726.in'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'DeTube',
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <BalanceProvider session={session}>
            <DynamicNavBarWrapper session={session}>
              {children}
              <SpeedInsights />
              <Analytics />
            </DynamicNavBarWrapper>
          </BalanceProvider>
        </Provider>
      </body>
    </html>
  );
}
