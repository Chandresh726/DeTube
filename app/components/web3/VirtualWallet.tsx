"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { IoMdArrowRoundDown, IoMdArrowRoundUp } from "react-icons/io";
import { useBalance } from '../../hooks/useBalance';
import Link from 'next/link';

const VirtualWallet = () => {
    const router = useRouter();
    const { balance } = useBalance();
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    return (
        <div className={`stat px-2 py-2 ${isExpanded ? 'flex-none' : ''}`}>
            <div className="divider my-1"></div>
            <div className='flex justify-between items-center mx-1'>
                <Link href="/statement">
                    <div className="stat-title">Current balance</div>
                    <div className="stat-value">{(balance / LAMPORTS_PER_SOL).toFixed(1)} YTSol</div>
                </Link>
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="btn btn-ghost p-2"
                >
                    {isExpanded ? <IoMdArrowRoundDown className='w-6 h-6' /> : <IoMdArrowRoundUp className='w-6 h-6' />}
                </div>
            </div>
            {isExpanded && (
                <div className="mx-1">
                    <div className="flex justify-between my-2 stat-actions">
                        <button
                            onClick={() => { router.push('/deposit'); }}
                            className="btn btn-sm btn-info"
                        >
                            Deposit
                        </button>
                        <button
                            onClick={() => { router.push('/withdraw'); }}
                            className="btn btn-sm btn-success"
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