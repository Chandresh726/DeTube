"use client";
import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import ConnectWallet from './ConnectWallet';
import { useTheme } from '../wrapper/ThemeContext';
import { depositRequest } from '../../util/fetch/wallet';
import { useBalance } from '../../hooks/useBalance';
import { Player } from '@lottiefiles/react-lottie-player';
import successAnimation from '../../../public/successAnimation.json';
import failureAnimation from '../../../public/failureAnimation.json';

const Deposit = ({ session }) => {
    const { theme } = useTheme();
    const { publicKey, connected, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [walletVerified, setWalletVerified] = useState<boolean>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const { refreshBalance } = useBalance();
    const [amount, setAmount] = useState<string>("0.0");
    const [loading, setLoading] = useState<boolean>(false);
    const [showAirdrop, setShowAirdrop] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [modalType, setModalType] = useState<'success' | 'failure'>('success');

    useEffect(() => {
        if (connected && publicKey) {
            fetchBalance(publicKey.toString());
        }
    }, [connected, publicKey]);

    const fetchBalance = async (address: string) => {
        try {
            const publicKey = new web3.PublicKey(address);
            const balanceLamports = await connection.getBalance(publicKey);
            setWalletBalance(balanceLamports);
            if (balanceLamports < LAMPORTS_PER_SOL) setShowAirdrop(true);
            else setShowAirdrop(false);
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
                refreshBalance();
                setModalMessage('Your deposit was processed successfully.');
                setModalType('success');
            } else {
                setModalMessage(`Deposit failed: ${res.message}`);
                setModalType('failure');
            }
        } catch (error) {
            console.error('Deposit transaction failed', error);
            setModalMessage('An error occurred during the deposit process.');
            setModalType('failure');
        } finally {
            fetchBalance(publicKey.toString());
            setModalVisible(true);
            setLoading(false);
            setAmount("0.0");
        }
    };

    const handleTextInputChange = (value: string) => {
        // Allow empty string (for backspace) and partial valid inputs like "3."
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            const numericValue = parseFloat(value);

            // Check if the value exceeds the balance
            if (!isNaN(numericValue) && numericValue <= walletBalance / LAMPORTS_PER_SOL) {
                setAmount(value);
            } else if (isNaN(numericValue)) {
                setAmount(value);
            }
        }
    };

    const handleBlur = () => {
        // Ensure the value is a valid multiple of 0.1 and within the allowable range
        const numericValue = parseFloat(amount);

        if (isNaN(numericValue) || numericValue < 0) {
            setAmount("0.0"); // Reset to 0.0 if the value is invalid or empty
        } else {
            // Round to nearest 0.1 multiple and ensure it doesn't exceed balance
            const roundedValue = Math.floor(numericValue * 10) / 10;
            const finalValue = Math.min(roundedValue, walletBalance / LAMPORTS_PER_SOL);
            setAmount(finalValue.toFixed(1));
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
                    <p className="text-lg text-center font-medium my-4">Wallet Balance: ${(walletBalance / LAMPORTS_PER_SOL).toFixed(2)} SOL</p>
                    {showAirdrop &&
                        <div className="text-md text-red-400 text-center my-1">You wallet balance is low. <a className='underline' target="_blank" href='https://faucet.solana.com/'>Get AirDrop</a></div>
                    }
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
                        max={walletBalance}
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

            {modalVisible && (
                <dialog open className={`modal`}>
                    <div className="modal-box">
                        <form method="dialog">
                            <button
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                onClick={() => setModalVisible(false)}
                            >
                                ✕
                            </button>
                        </form>
                        <h3 className={`font-bold text-lg ${modalType === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                            {modalType === 'success' ? 'Success!' : 'Failure!'}
                        </h3>
                        <Player
                            autoplay
                            loop={true}
                            src={modalType === 'success' ? successAnimation : failureAnimation}
                            style={{ height: '200px', width: '200px' }}
                        />
                        <p className="py-4">{modalMessage}</p>
                    </div>
                </dialog>
            )}

        </div>
    );
};

export default Deposit;