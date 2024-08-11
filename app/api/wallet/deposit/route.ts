import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';
import prisma from '../../util/prisma';

const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');

export async function POST(req: NextRequest) {
    try {
        const { address, amount, signature } = await req.json();

        if (!address || !amount || !signature) {
            return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
        }

        // Check if the wallet exists and is verified
        const wallet = await prisma.wallet.findUnique({
            where: { address },
            include: { user: true }, // Include the user associated with the wallet
        });

        if (!wallet) {
            return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
        }

        // Create a new transaction record in the database with status PENDING
        const transaction = await prisma.transaction.create({
            data: {
                walletId: wallet.id,
                amount: parseInt(amount),
                type: 'DEPOSIT',
                signature,
            },
        });

        // Check transaction status
        const transactionStatus = await connection.getSignatureStatus(signature);
        console.log(transactionStatus);

        // Determine new balance and transaction status
        const newStatus = transactionStatus?.value?.confirmations ? 'SUCCESS' : 'FAILED';
        const balanceChange = newStatus === 'SUCCESS' ? parseInt(amount) : 0;

        // Update the transaction status and user balance in the database
        await prisma.$transaction(async (prisma) => {
            const trnx = await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: newStatus,
                },
            });
            console.log(trnx);

            if (newStatus === 'SUCCESS') {
                const user = await prisma.user.update({
                    where: { id: wallet.userId },
                    data: {
                        balance: {
                            increment: balanceChange,
                        },
                    },
                });
                console.log(user);
            }
        });

        return NextResponse.json({ success: true, status: newStatus });
    } catch (error) {
        console.error('Failed to process deposit', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}