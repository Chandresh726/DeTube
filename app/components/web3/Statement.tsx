"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserStatement } from '../../util/fetch/wallet';
import StatementLoading from '../loading/StatementLoading';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDTSol } from '@/lib/utils';

type Tx = {
  createdAt: string;
  amount: string | number;
  status: string;
  signature?: string | null;
  wallet?: { address: string };
  channel?: { id: number; name: string };
};

type StatementData = {
  DEPOSIT: Tx[];
  WITHDRAWAL: Tx[];
  THANKS: Tx[];
};

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: 'numeric',
    });
    return `${formattedDate} ${formattedTime}`;
}

function TruncatedText({ text }: { text: string }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="block max-w-64 truncate">{text}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs break-all">{text}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function VisitLink({ href, label = 'Visit' }: { href: string; label?: string }) {
    const internal = href.startsWith('/');
    if (internal) {
        return (
            <Link href={href} className="ml-2 text-sm text-primary hover:underline">
                {label}
            </Link>
        );
    }
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-primary hover:underline">
            {label}
        </a>
    );
}

function StatusBadge({ status }: { status: string }) {
    const ok = status === 'SUCCESS';
    return <Badge variant={ok ? 'secondary' : 'destructive'}>{status}</Badge>;
}

function TxTable({ rows, kind }: { rows: Tx[]; kind: 'DEPOSIT' | 'WITHDRAWAL' | 'THANKS' }) {
    if (rows.length === 0) {
        const label = kind === 'DEPOSIT' ? 'No Deposit Transactions' : kind === 'WITHDRAWAL' ? 'No Withdrawal Transactions' : 'No Thanks Transactions';
        return (
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">{label}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        );
    }
    if (kind === 'THANKS') {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Created At</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((transaction, index) => (
                        <TableRow key={index}>
                            <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                            <TableCell>{formatDTSol(Number(transaction.amount))} DTSol</TableCell>
                            <TableCell>
                                {transaction.channel?.name}
                                {transaction.channel ? <VisitLink href={`/channel/${transaction.channel.id}`} /> : null}
                            </TableCell>
                            <TableCell><StatusBadge status={transaction.status} /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }
    const walletLabel = kind === 'DEPOSIT' ? 'From Wallet' : 'To Wallet';
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Created At</TableHead>
                    <TableHead className="hidden lg:table-cell">{walletLabel}</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden lg:table-cell">Signature</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((transaction, index) => (
                    <TableRow key={index}>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                            {transaction.wallet ? <TruncatedText text={transaction.wallet.address} /> : '—'}
                        </TableCell>
                        <TableCell>{formatDTSol(Number(transaction.amount))} {kind === 'THANKS' ? 'DTSol' : 'SOL'}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center">
                                {transaction.signature ? <TruncatedText text={transaction.signature} /> : '—'}
                                {transaction.signature && <VisitLink href={`https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`} />}
                            </div>
                        </TableCell>
                        <TableCell><StatusBadge status={transaction.status} /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

const Statement = ({ session }: { session: { user: { id: number } } }) => {
    const [statement, setStatement] = useState<StatementData | null>(null);

    useEffect(() => {
        let cancelled = false;
        const getStatement = async (id: number) => {
            if (!id) return;
            const data = await getUserStatement(id);
            if (!cancelled && data) {
                setStatement(data as StatementData);
            }
        };
        if (session?.user?.id) {
            getStatement(session.user.id);
        }
        return () => {
            cancelled = true;
        };
    }, [session]);

    if (!statement) return <StatementLoading />

    return (
        <div>
            <div className="my-2 text-center text-3xl font-bold">Your Transactions</div>
            <Accordion type="multiple" defaultValue={['deposit']} className="flex flex-col gap-4">
                <Card className="px-4 py-0">
                    <AccordionItem value="deposit" className="border-0">
                        <AccordionTrigger className="text-xl font-medium">Deposit Transactions</AccordionTrigger>
                        <AccordionContent>
                            <TxTable rows={statement.DEPOSIT} kind="DEPOSIT" />
                        </AccordionContent>
                    </AccordionItem>
                </Card>
                <Card className="px-4 py-0">
                    <AccordionItem value="withdraw" className="border-0">
                        <AccordionTrigger className="text-xl font-medium">Withdraw Transactions</AccordionTrigger>
                        <AccordionContent>
                            <TxTable rows={statement.WITHDRAWAL} kind="WITHDRAWAL" />
                        </AccordionContent>
                    </AccordionItem>
                </Card>
                <Card className="px-4 py-0">
                    <AccordionItem value="thanks" className="border-0">
                        <AccordionTrigger className="text-xl font-medium">Thanks Transactions</AccordionTrigger>
                        <AccordionContent>
                            <TxTable rows={statement.THANKS} kind="THANKS" />
                        </AccordionContent>
                    </AccordionItem>
                </Card>
            </Accordion>
        </div>
    )
}

export default Statement;
