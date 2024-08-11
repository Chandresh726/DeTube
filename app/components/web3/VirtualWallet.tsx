"use client";
import React, { useEffect, useState } from 'react';
import { getUserBalance } from '../../util/fetch/wallet';
import { useRouter } from 'next/navigation';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const VirtualWallet = ({ userId }) => {
    const router = useRouter();
    const [balance, setBalance] = useState<number>(0);
    const [lockedBalance, setLockedBalance] = useState<number>(0);

    useEffect(() => {
        const getBalance = async () => {
            try {
                const res = await getUserBalance(userId);
                setBalance(res.balance)
                setLockedBalance(res.lockedBalance)
            } catch {
                console.log("error")
            }
        }
        getBalance()
    }, [balance])

    return (
        <div className="px-2 py-4">
            <div className="divider my-1"></div>
            <div className="mb-2 text-center">
                <p className="text-lg">Balance: {(balance / LAMPORTS_PER_SOL).toFixed(1)} Sol</p>
                {lockedBalance !== 0 && <p className='text-sm'> {(lockedBalance / LAMPORTS_PER_SOL).toFixed(1)} Sol are locked at the moment.</p>}
            </div>
            <div className="flex justify-around">
                <button
                    onClick={() => { router.push('/deposit') }}
                    className="btn btn-info"
                >
                    Deposit
                </button>
                <button
                    onClick={() => { router.push('/withdraw') }}
                    className="btn btn-success"
                    disabled={balance <= 0}
                >
                    Withdraw
                </button>
            </div>
        </div>
    );
};

export default VirtualWallet;