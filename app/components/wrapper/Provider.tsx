import React from 'react'
import SessionWrapper from './SessionWrapper';
import AppWalletProvider from './AppWalletProvider';
import { ThemeProvider } from './ThemeContext';

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