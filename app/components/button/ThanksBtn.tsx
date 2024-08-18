"use client";
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CiHeart } from "react-icons/ci";
import { useTheme } from '../wrapper/ThemeContext';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getUserBalance } from '../../util/fetch/wallet';
import { sendThanks } from '../../util/fetch/channel';

const ThanksButton = ({ channelId, channelName }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const { theme } = useTheme();
    const [balance, setBalance] = useState<number>(0);
    const [amount, setAmount] = useState<string>("0");
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    useEffect(() => {
        if (session?.user.id) {
            fetchBalanceFromBackend(session.user.id);
        }
    }, [session]);

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

    const handleRangeInputChange = (value: number) => {
        // Convert from lamports to SOL
        const solValue = (value / LAMPORTS_PER_SOL).toFixed(1);
        setAmount(solValue);
    };

    const handleThanks = async () => {
        if (!session) {
            router.push('/logIn');
            return;
        }

        setLoading(true);
        setSuccess(false);
        try {
            // Notify backend about the thank you transaction
            const res = await sendThanks(parseFloat(amount) * LAMPORTS_PER_SOL, session.user.id, channelId);

            if (res.success) {
                setSuccess(true);
            } else {
                alert(`Thanks failed: ${res.message}`);
            }
        } catch (error) {
            console.error('Thank you transaction failed', error);
            alert('An error occurred during the transaction.');
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        const modal = document.getElementById('my_modal_3') as HTMLDialogElement;
        modal.showModal();
    };

    return (
        <div className={`flex flex-col mt-4 mx-2 items-center w-full rounded-3xl bg-blue-400 ${theme === 'dark' ? '' : 'text-black'}`}>
            <button
                onClick={openModal}
                className={`py-2 rounded-lg font-semibold transition-colors duration-300 hover:opacity-75`}
            >
                <div className='flex items-center'>
                    Thanks
                    <CiHeart className='mx-1 w-6 h-6' />
                </div>
            </button>
            <dialog id="my_modal_3" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <div>
                        <div className='text-lg font-bold'>Thanks : {channelName}</div>
                        <div className="divider my-1"></div>
                        {success ? (
                            <div className='my-4 text-center'>
                                <p className="text-2xl text-center text-green-500 font-medium my-4">Sent {amount} SOL successfully!</p>
                                <button className='btn btn-info' onClick={() => { setSuccess(false) }}>Send Again</button>
                            </div>
                        ) : (
                            <div className='flex flex-col'>
                                <p className="text-lg text-center font-medium my-4">Available Balance: {(balance / LAMPORTS_PER_SOL).toFixed(2)} SOL</p>
                                <input
                                    type="range"
                                    min={0}
                                    max={balance}
                                    step={LAMPORTS_PER_SOL / 5} // Step by 0.2 SOL in lamports
                                    value={parseFloat(amount) * LAMPORTS_PER_SOL || 0}
                                    onChange={(e) => handleRangeInputChange(parseFloat(e.target.value))}
                                    className="range range-lg range-success my-4"
                                />
                                <button
                                    className='btn btn-outline btn-error my-4'
                                    onClick={handleThanks}
                                    disabled={loading || parseFloat(amount) <= 0}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {loading ? 'Processing...' : `Send ${amount} SOL`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default ThanksButton;