import { createContext } from 'react';

// Define the context shape
export interface BalanceContextProps {
    balance: number | null;
    loading: boolean;
    error: string | null;
    refreshBalance: () => Promise<void>;
}

// Create a context with a default value of `undefined`
export const BalanceContext = createContext<BalanceContextProps | undefined>(undefined);