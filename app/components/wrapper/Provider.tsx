 "use client";
import React from 'react'
import dynamic from 'next/dynamic';
import SessionWrapper from './SessionWrapper';
import { ThemeProvider } from './ThemeContext';

const AppWalletProvider = dynamic(() => import('./AppWalletProvider'), { ssr: false });

const Provider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <SessionWrapper>
            <AppWalletProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </AppWalletProvider>
        </SessionWrapper>
    )
}

export default Provider
