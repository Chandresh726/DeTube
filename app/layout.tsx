import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from './components/wrapper/SessionWrapper';
import { getServerSession } from "next-auth";
// import NavBarWrapper from "./components/wrapper/NavBarWrapper";
import dynamic from "next/dynamic";
import { ThemeProvider } from "./components/wrapper/ThemeContext";
import { authOptions } from "./util/auth";
import AppWalletProvider from "./components/AppWalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Youtube 3.0",
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
    <SessionWrapper>
      <AppWalletProvider>
        <ThemeProvider>
          <html lang="en">
            <body className={inter.className}>
              <NavbarWrapper session={session}>
                {children}
              </NavbarWrapper>
            </body>
          </html>
        </ThemeProvider>
      </AppWalletProvider>
    </SessionWrapper>
  );
}