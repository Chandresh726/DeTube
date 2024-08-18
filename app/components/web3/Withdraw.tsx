"use client";
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import ConnectWallet from './ConnectWallet';
import { useTheme } from '../wrapper/ThemeContext';
import { getUserBalance, withdrawRequest } from '../../util/fetch/wallet';

const Withdraw = ({ session }) => {
    const { theme } = useTheme();
    const { publicKey, connected } = useWallet();
    const [walletVerified, setWalletVerified] = useState<boolean>(null);
    const [balance, setBalance] = useState<number>(0);
    const [amount, setAmount] = useState<string>("0");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (connected && publicKey) {
            fetchBalanceFromBackend(session?.user.id);
        } else {
            setWalletVerified(null);
        }
    }, [connected, publicKey]);

    const fetchBalanceFromBackend = async (userId: number) => {
        try {
            const response = await getUserBalance(userId);
            if (response) {
                setBalance(response.balance);
            } else {
                console.error('Failed to fetch balance');
            }
        } catch (error) {
            console.error('Failed to fetch balance', error);
        }
    };

    const handleWithdraw = async () => {
        if (!publicKey || !walletVerified || parseFloat(amount) <= 0) return;
    
        setLoading(true);
        try {
            // Notify backend about the withdrawal
            const res = await withdrawRequest(publicKey.toString(), parseFloat(amount) * LAMPORTS_PER_SOL, session.user.id);
    
            if (res.success) {
                alert('Withdrawal successful');
                window.location.reload();
            } else {
                alert(`Withdrawal failed: ${res.message}`);
            }
        } catch (error) {
            console.error('Withdrawal transaction failed', error);
            alert('An error occurred during the withdrawal process.');
        } finally {
            setLoading(false);
        }
    };

    const handleTextInputChange = (value: string) => {
        // Validate input to allow only numbers and decimals
        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const handleBlur = () => {
        // Round to the nearest 0.1 SOL on blur
        const numericValue = parseFloat(amount);
        if (!isNaN(numericValue)) {
            setAmount((Math.floor(numericValue * 10) / 10).toFixed(1));
        } else {
            setAmount("0");
        }
    };

    const handleRangeInputChange = (value: number) => {
        // Convert from lamports to SOL
        const solValue = (value / LAMPORTS_PER_SOL).toFixed(1);
        setAmount(solValue);
    };

    return (
        <div className={`p-6 max-w-md mx-auto mt-10 ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>
            <ConnectWallet setWalletVerified={setWalletVerified} userId={session?.user.id} />
            <div className="divider my-1"></div>
            {connected && walletVerified ? (
                <div className='flex flex-col'>
                    <p className="text-lg text-center font-medium my-4">Available Balance: {(balance / LAMPORTS_PER_SOL).toFixed(2)} SOL</p>
                    <input
                        type="text"
                        className='input input-bordered w-full my-2'
                        value={amount}
                        onChange={(e) => handleTextInputChange(e.target.value)}
                        onBlur={handleBlur}
                        placeholder="Enter amount to withdraw"
                    />
                    <input
                        type="range"
                        min={0}
                        max={balance}
                        step={LAMPORTS_PER_SOL / 10} // Step by 0.1 SOL in lamports
                        value={parseFloat(amount) * LAMPORTS_PER_SOL || 0}
                        onChange={(e) => handleRangeInputChange(parseFloat(e.target.value))}
                        className="range my-2"
                    />
                    <button
                        className='btn btn-active btn-primary my-2'
                        onClick={handleWithdraw}
                        disabled={loading || parseFloat(amount) <= 0}
                    >
                        {loading ? 'Processing...' : `Withdraw ${amount} SOL`}
                    </button>
                </div>
            ) : (
                <p className="text-md">Please connect and verify your wallet to withdraw.</p>
            )}
        </div>
    );
};

export default Withdraw;