import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from './util/auth';
import { BalanceProvider } from './hooks/useBalance';
import Provider from './components/wrapper/Provider';
import NavBarWrapper from './components/wrapper/NavBarWrapper';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'DeTube - Decentralized Video Platform',
    template: '%s | DeTube',
  },
  description: 'Watch and share videos on DeTube, the decentralized video streaming platform',
  keywords: ['decentralized video', 'blockchain video', 'web3 streaming', 'DeTube'],
  metadataBase: new URL('https://detube.slope726.in'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'DeTube',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <TooltipProvider>
          <Provider>
            <BalanceProvider session={session}>
              <NavBarWrapper session={session}>
                {children}
                <SpeedInsights />
                <Analytics />
              </NavBarWrapper>
            </BalanceProvider>
          </Provider>
        </TooltipProvider>
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
