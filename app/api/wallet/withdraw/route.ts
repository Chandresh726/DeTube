import { NextRequest, NextResponse } from 'next/server';
import * as web3 from '@solana/web3.js';
import prisma from '../../util/prisma';
import bs58 from 'bs58';

export async function POST(req: NextRequest) {
    try {
        const { userId, walletAddress, amount } = await req.json();

        if (!userId || !walletAddress || !amount) {
            return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
        }

        // Convert amount to BigInt to avoid mixing with Number types
        const amountBigInt = BigInt(amount);

        // Fetch the user's wallet from the database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { wallets: true },
        });

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const wallet = user.wallets.find(wallet => wallet.address === walletAddress);

        if (!wallet) {
            return NextResponse.json({ success: false, message: 'Wallet not found' }, { status: 404 });
        }

        // Convert user's balance to BigInt for comparison
        const userBalanceBigInt = BigInt(user.balance);

        if (userBalanceBigInt < amountBigInt) {
            return NextResponse.json({ success: false, message: 'Insufficient balance' }, { status: 400 });
        }

        const connection = new web3.Connection(process.env.SOLANA_RPC_URL, 'confirmed');
        const centralWallet = web3.Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY));

        const transaction = new web3.Transaction();
        const recipientPubKey = new web3.PublicKey(walletAddress);
        const sendSolInstruction = web3.SystemProgram.transfer({
            fromPubkey: centralWallet.publicKey,
            toPubkey: recipientPubKey,
            lamports: Number(amountBigInt),  // Explicit conversion to Number for the Solana transfer
        });
        transaction.add(sendSolInstruction);

        try {
            // Send the transaction and wait for confirmation
            const signature = await web3.sendAndConfirmTransaction(connection, transaction, [centralWallet]);

            // Use a database transaction to update the user's balance and log the transaction
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: userId },
                    data: {
                        balance: userBalanceBigInt - amountBigInt, // Update balance using BigInt
                    },
                }),
                prisma.transaction.create({
                    data: {
                        userId: wallet.userId,
                        walletId: wallet.id,
                        amount: amountBigInt, // Log amount using BigInt
                        type: 'WITHDRAWAL',
                        status: 'SUCCESS',
                        signature,
                    },
                }),
            ]);

            return NextResponse.json({ success: true, message: 'Withdrawal successful', signature }, { status: 200 });

        } catch (transactionError) {
            // Handle transaction failure
            console.error('Transaction failed', transactionError);

            // Log the failed transaction in the database
            await prisma.transaction.create({
                data: {
                    userId: wallet.userId,
                    walletId: wallet.id,
                    amount: amountBigInt, // Store BigInt directly in the database
                    type: 'WITHDRAWAL',
                    status: 'FAILED',
                    signature: null, // No signature since the transaction failed
                },
            });

            return NextResponse.json({ success: false, message: 'Transaction failed', error: transactionError.message }, { status: 500 });
        }

    } catch (error) {
        console.error('Withdrawal request failed', error);
        return NextResponse.json({ success: false, message: 'Withdrawal request failed', error: error.message }, { status: 500 });
    }
}