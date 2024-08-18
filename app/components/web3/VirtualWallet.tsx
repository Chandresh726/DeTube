"use client";
import React, { useEffect, useState } from 'react';
import { getUserBalance } from '../../util/fetch/wallet';
import { useRouter } from 'next/navigation';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { IoMdArrowRoundDown, IoMdArrowRoundUp } from "react-icons/io";

const VirtualWallet = ({ userId }) => {
    const router = useRouter();
    const [balance, setBalance] = useState<number>(0);
    const [lockedBalance, setLockedBalance] = useState<number>(0);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    useEffect(() => {
        const getBalance = async () => {
            try {
                const res = await getUserBalance(userId);
                setBalance(res.balance);
                setLockedBalance(res.lockedBalance);
            } catch {
                console.log("error");
            }
        };
        getBalance();
    }, [userId]);

    return (
        <div className={`px-2 py-1 ${isExpanded ? 'flex-none' : ''}`}>
            <div className="divider my-1"></div>
            <div className='flex justify-between items-center mx-1'>
                <p className="text-lg font-bold">Balance: {(balance / LAMPORTS_PER_SOL).toFixed(1)} Sol</p>
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="btn btn-ghost p-2"
                >
                    {isExpanded ? <IoMdArrowRoundDown className='w-6 h-6' /> : <IoMdArrowRoundUp className='w-6 h-6' />}
                </div>
            </div>
            {isExpanded && (
                <div className="mx-1">
                    <div className='btn btn-ghost w-full text-lg' onClick={() => { router.push('/statement'); }}>View Transactions</div>
                    <div className="flex justify-between my-2">
                        <button
                            onClick={() => { router.push('/deposit'); }}
                            className="btn btn-info"
                        >
                            Deposit
                        </button>
                        <button
                            onClick={() => { router.push('/withdraw'); }}
                            className="btn btn-success"
                            disabled={balance <= 0}
                        >
                            Withdraw
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VirtualWallet;