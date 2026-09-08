 "use client";
import React from 'react'
import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
import SessionWrapper from './SessionWrapper';

const AppWalletProvider = dynamic(() => import('./AppWalletProvider'), { ssr: false });

const Provider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <SessionWrapper>
            <AppWalletProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </AppWalletProvider>
        </SessionWrapper>
    )
}

export default Provider
