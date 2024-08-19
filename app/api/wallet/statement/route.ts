import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const userId = parseInt(url.searchParams.get('id') || '', 10);

    if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    try {
        // Fetch transactions for the given user ID
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc' // Sort by recent transactions first
            },
            include: {
                wallet: true, // Include wallet information
                channel: true
            }
        });

        // Convert BigInt values to string for serialization
        const transactionsWithStringAmounts = transactions.map(transaction => ({
            ...transaction,
            amount: transaction.amount.toString() // Convert BigInt to string
        }));

        // Initialize grouped transactions with empty arrays for each type
        const groupedTransactions: Record<string, typeof transactionsWithStringAmounts> = {
            DEPOSIT: [],
            WITHDRAWAL: [],
            THANKS: []
        };

        // Group transactions by type
        transactionsWithStringAmounts.forEach(transaction => {
            const type = transaction.type;
            if (!groupedTransactions[type]) {
                groupedTransactions[type] = [];
            }
            groupedTransactions[type].push(transaction);
        });

        // Return grouped transactions
        return NextResponse.json(groupedTransactions, { status: 200 });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}