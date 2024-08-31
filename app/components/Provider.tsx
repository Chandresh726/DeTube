import React from 'react'
import SessionWrapper from './wrapper/SessionWrapper';
import AppWalletProvider from './AppWalletProvider';
import { ThemeProvider } from './wrapper/ThemeContext';

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