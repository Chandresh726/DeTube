"use client";
import { ReactNode, useContext, useEffect, useState } from "react";
import { BalanceContext, BalanceContextProps } from "./BalanceContext";
import { getUserBalance } from "../util/fetch/wallet";

// Custom hook to consume the balance context
export const useBalance = (): BalanceContextProps => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};

// Hook to provide balance management logic
const useProvideBalance = (id: number): BalanceContextProps => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async (userId: number) => {
    setLoading(true);
    try {
      const response = await getUserBalance(userId);
      if (response) {
        setBalance(response.balance);
      }
    } catch (err) {
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id !== undefined) {
      fetchBalance(id);
    }
  }, [id]);

  const refreshBalance = async () => {
    if (id !== undefined) {
      await fetchBalance(id);
    }
  };

  return {
    balance,
    loading,
    error,
    refreshBalance,
  };
};

// Define the props for the provider component
interface BalanceProviderProps {
  session: any;
  children: ReactNode;
}

// Provider component that supplies the balance context to its children
export const BalanceProvider = ({ session, children }: BalanceProviderProps) => {
  const id = session?.user?.id;
  const balance = useProvideBalance(id);
  return (
    <BalanceContext.Provider value={balance}>
      {children}
    </BalanceContext.Provider>
  );
};