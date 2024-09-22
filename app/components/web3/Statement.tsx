"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../wrapper/ThemeContext';
import { getUserStatement } from '../../util/fetch/wallet';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import StatementLoading from '../loading/StatementLoading';

const Statement = ({ session }) => {
    const { theme } = useTheme();
    const [statement, setStatement] = useState(null);

    const getStatement = async (id: number) => {
        if (id) {
            const data = await getUserStatement(id);
            if (data) {
                setStatement(data);
            }
        }
    }

    useEffect(() => {
        if (session) {
            getStatement(session.user.id);
        }
    }, [session]);

    if (!statement) return <StatementLoading />

    // Format the date to a readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);

        // Format date
        const formattedDate = date.toLocaleDateString();

        // Format time without seconds
        const formattedTime = date.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: 'numeric',
        });

        return `${formattedDate} ${formattedTime}`;
    }


    // Format the amount
    const formatAmount = (amountString) => {
        const amount = Number(amountString) / LAMPORTS_PER_SOL;
        return amount.toFixed(1);
    }

    // Truncate long text with tooltip
    const TruncatedText = ({ text }) => (
        <div className="relative group">
            <span className="truncate block max-w-64">{text}</span>
            <div className="absolute left-0 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded-lg p-2 transition-opacity duration-300">
                {text}
            </div>
        </div>
    );

    // Visit link component
    const VisitLink = ({ href }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm ml-2 hover:underline">
            Visit
        </a>
    );

    return (
        <div className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            <div className='text-center text-3xl my-2 font-bold'>Your Transactions</div>

            {/* Deposit Transactions */}
            <div className={`collapse collapse-arrow my-4 ${theme === 'dark' ? 'bg-base-200' : 'bg-gray-300'}`}>
                <input type="radio" name="my-accordion-2" defaultChecked />
                <div className="collapse-title text-xl font-medium">Deposit Transactions</div>
                <div className="collapse-content">
                    <div className="divider my-1"></div>
                    <table className="table table-xs md:table-md">
                        <thead>
                            <tr>
                                <th>Created At</th>
                                <th className="hidden lg:table-cell">From Wallet</th>
                                <th>Amount</th>
                                <th className="hidden lg:table-cell">Signature</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statement.DEPOSIT.length > 0 ? (
                                statement.DEPOSIT.map((transaction, index) => (
                                    <tr key={index}>
                                        <td>{formatDate(transaction.createdAt)}</td>
                                        <td className="hidden lg:table-cell">
                                            <TruncatedText text={transaction.wallet.address} />
                                        </td>
                                        <td>{formatAmount(transaction.amount)} Sol</td>
                                        <td className="hidden lg:table-cell">
                                            <div className='flex'>
                                                <TruncatedText text={transaction.signature} />
                                                {transaction.signature && <VisitLink href={`https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`} />}
                                            </div>
                                        </td>
                                        <td className={transaction.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>{transaction.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className='text-center'>No Deposit Transactions</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Withdraw Transactions */}
            <div className={`collapse collapse-arrow my-4 ${theme === 'dark' ? 'bg-base-200' : 'bg-gray-300'}`}>
                <input type="radio" name="my-accordion-2" />
                <div className="collapse-title text-xl font-medium">Withdraw Transactions</div>
                <div className="collapse-content">
                    <div className="divider my-1"></div>
                    <table className="table table-xs md:table-md">
                        <thead>
                            <tr>
                                <th>Created At</th>
                                <th className="hidden lg:table-cell">To Wallet</th>
                                <th>Amount</th>
                                <th className="hidden lg:table-cell">Signature</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statement.WITHDRAWAL.length > 0 ? (
                                statement.WITHDRAWAL.map((transaction, index) => (
                                    <tr key={index}>
                                        <td>{formatDate(transaction.createdAt)}</td>
                                        <td className="hidden lg:table-cell">
                                            <TruncatedText text={transaction.wallet.address} />
                                        </td>
                                        <td>{formatAmount(transaction.amount)} Sol</td>
                                        <td className="hidden lg:table-cell">
                                            <div className='flex'>
                                                <TruncatedText text={transaction.signature} />
                                                {transaction.signature && <VisitLink href={`https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`} />}
                                            </div>
                                        </td>
                                        <td className={transaction.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>{transaction.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className='text-center'>No Withdrawal Transactions</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Thanks Transactions */}
            <div className={`collapse collapse-arrow my-4 ${theme === 'dark' ? 'bg-base-200' : 'bg-gray-300'}`}>
                <input type="radio" name="my-accordion-2" />
                <div className="collapse-title text-xl font-medium">Thanks Transactions</div>
                <div className="collapse-content">
                    <div className="divider my-1"></div>
                    <table className="table table-xs md:table-md">
                        <thead>
                            <tr>
                                <th>Created At</th>
                                <th>Amount</th>
                                <th>Channel</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statement.THANKS.length > 0 ? (
                                statement.THANKS.map((transaction, index) => (
                                    <tr key={index}>
                                        <td>{formatDate(transaction.createdAt)}</td>
                                        <td>{formatAmount(transaction.amount)} YTSol</td>
                                        <td>
                                            {transaction.channel?.name}
                                            {transaction.channel?.name && <VisitLink href={`/channel/${transaction.channel.id}`} />}
                                        </td>
                                        <td className={transaction.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>{transaction.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className='text-center'>No Thanks Transactions</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Statement;