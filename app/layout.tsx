import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import dynamic from "next/dynamic";
import { authOptions } from "./util/auth";
import { BalanceProvider } from "./hooks/useBalance";
import Provider from "./components/wrapper/Provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeTube",
  icons: {
    icon: "logo.png",
  },
};

const NavbarWrapper = dynamic(
  () => {
    return import("./components/wrapper/NavBarWrapper");
  },
  { ssr: false }
)

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <Provider>
      <html lang="en">
        <body className={inter.className}>
          <BalanceProvider session={session}>
            <NavbarWrapper session={session}>
              {children}
              <SpeedInsights />
              <Analytics />
            </NavbarWrapper>
          </BalanceProvider>
        </body>
      </html>
    </Provider>
  );
}