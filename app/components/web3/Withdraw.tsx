"use client";
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import ConnectWallet from './ConnectWallet';
import { useTheme } from '../wrapper/ThemeContext';
import { withdrawRequest } from '../../util/fetch/wallet';
import { useBalance } from '../../hooks/useBalance';
import { Player } from '@lottiefiles/react-lottie-player';
import successAnimation from '../../../public/successAnimation.json';
import failureAnimation from '../../../public/failureAnimation.json';

const Withdraw = ({ session }) => {
    const { theme } = useTheme();
    const { publicKey, connected } = useWallet();
    const [walletVerified, setWalletVerified] = useState<boolean>(null);
    const { balance, refreshBalance } = useBalance();
    const [amount, setAmount] = useState<string>("0.0");
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [modalType, setModalType] = useState<'success' | 'failure'>('success');

    const handleWithdraw = async () => {
        if (!publicKey || !walletVerified || parseFloat(amount) <= 0) return;

        setLoading(true);
        try {
            // Notify backend about the withdrawal
            const res = await withdrawRequest(publicKey.toString(), parseFloat(amount) * LAMPORTS_PER_SOL, session.user.id);
            if (res.success) {
                refreshBalance();
                setModalMessage('Your withdrawal was processed successfully.');
                setModalType('success');
            } else {
                setModalMessage(`Withdrawal failed: ${res.message}`);
                setModalType('failure');
            }
        } catch (error) {
            console.error('Withdrawal transaction failed', error);
            setModalMessage('An error occurred during the withdrawal process.');
            setModalType('failure');
        } finally {
            setModalVisible(true);
            setLoading(false);
            setAmount("0.0");
        }
    };

    const handleTextInputChange = (value: string) => {
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue) && numericValue <= balance / LAMPORTS_PER_SOL) {
                setAmount(value);
            } else if (isNaN(numericValue)) {
                setAmount(value);
            }
        }
    };

    const handleBlur = () => {
        const numericValue = parseFloat(amount);
        if (isNaN(numericValue) || numericValue < 0) {
            setAmount("0.0");
        } else {
            const roundedValue = Math.floor(numericValue * 10) / 10;
            const finalValue = Math.min(roundedValue, balance / LAMPORTS_PER_SOL);
            setAmount(finalValue.toFixed(1));
        }
    };

    const handleRangeInputChange = (value: number) => {
        const solValue = (value / LAMPORTS_PER_SOL).toFixed(1);
        setAmount(solValue);
    };

    return (
        <div className={`p-6 max-w-md mx-auto mt-10 ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>
            <ConnectWallet setWalletVerified={setWalletVerified} userId={session?.user.id} />
            <div className="divider my-1"></div>
            {connected && walletVerified ? (
                <div className='flex flex-col'>
                    <p className="text-lg text-center font-medium my-4">Available Balance: {(balance / LAMPORTS_PER_SOL).toFixed(2)} DTSol</p>
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
                        step={LAMPORTS_PER_SOL / 10}
                        value={parseFloat(amount) * LAMPORTS_PER_SOL || 0}
                        onChange={(e) => handleRangeInputChange(parseFloat(e.target.value))}
                        className="range my-2"
                    />
                    <button
                        className='btn btn-active btn-primary my-2'
                        onClick={handleWithdraw}
                        disabled={loading || parseFloat(amount) <= 0}
                    >
                        {loading ? 'Processing...' : `Withdraw ${amount} DTSol`}
                    </button>
                </div>
            ) : (
                <p className="text-md">Please connect and verify your wallet to withdraw.</p>
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

export default Withdraw;