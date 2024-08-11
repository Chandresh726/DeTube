"use client";
import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import ConnectWallet from './ConnectWallet';
import { useTheme } from '../wrapper/ThemeContext';
import { depositRequest } from '../../util/fetch/wallet';

const Deposit = ({ session }) => {
    const { theme } = useTheme();
    const { publicKey, connected, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [walletVerified, setWalletVerified] = useState<boolean>(null);
    const [balance, setBalance] = useState<number>(0);
    const [amount, setAmount] = useState<string>("0");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (connected && publicKey) {
            fetchBalance(publicKey.toString());
        }
    }, [connected, publicKey]);

    const fetchBalance = async (address: string) => {
        try {
            const publicKey = new web3.PublicKey(address);
            const balanceLamports = await connection.getBalance(publicKey);
            setBalance(balanceLamports);
        } catch (error) {
            console.error('Failed to fetch balance', error);
        }
    };

    const handleDeposit = async () => {
        if (!publicKey || !walletVerified) return;

        setLoading(true);
        try {
            const transaction = new web3.Transaction();
            const recipientPubKey = new web3.PublicKey(process.env.NEXT_PUBLIC_WALLET_PUBLIC_KEY);
            const sendSolInstruction = web3.SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipientPubKey,
                lamports: parseFloat(amount) * LAMPORTS_PER_SOL, // Convert SOL to lamports
            });
            transaction.add(sendSolInstruction);

            const signature = await sendTransaction(transaction, connection);
            const latestBlockHash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: signature,
            });

            // Notify backend about the deposit
            const res = await depositRequest(publicKey.toString(), (parseFloat(amount) * LAMPORTS_PER_SOL), signature)
            if (res.success) {
                window.location.reload();
            } else {
                alert('Deposit failed');
            }
        } catch (error) {
            console.error('Deposit transaction failed', error);
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
                    <p className="text-lg text-center font-medium my-4">Wallet Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(2)} SOL</p>
                    <input
                        type="text"
                        className='input input-bordered w-full my-2'
                        value={amount}
                        onChange={(e) => handleTextInputChange(e.target.value)}
                        onBlur={handleBlur}
                        placeholder="Enter amount to deposit"
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
                        onClick={handleDeposit}
                        disabled={loading || parseFloat(amount) <= 0}
                    >
                        {loading ? 'Processing...' : `Deposit ${amount} SOL`}
                    </button>
                </div>
            ) : (
                <p className="text-md">Please connect and verify your wallet to deposit.</p>
            )}
        </div>
    );
};

export default Deposit;