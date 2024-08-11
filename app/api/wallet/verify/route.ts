import { NextRequest, NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import prisma from '../../util/prisma';

export async function POST(req: NextRequest) {
    try {
        const { publicKey, signature, message, userId } = await req.json();

        if (!publicKey || !signature || !message || !userId) {
            return NextResponse.json({ isVerified: false, error: 'Invalid request' }, { status: 400 });
        }

        // Decode the public key and signature
        const publicKeyBytes = bs58.decode(publicKey);
        const signatureBytes = bs58.decode(signature);

        // Verify the signature
        const isValid = nacl.sign.detached.verify(
            Buffer.from(message),
            signatureBytes,
            publicKeyBytes
        );

        if (!isValid) {
            return NextResponse.json({ isVerified: false, error: 'Signature verification failed' });
        }

        // Check if the wallet already exists for the user
        const existingWallet = await prisma.wallet.findFirst({
            where: {
                address: publicKey,
                userId: userId,
            },
        });

        if (existingWallet) {
            return NextResponse.json({ isVerified: true, message: 'Wallet already verified' });
        }

        // Create a new wallet entry in the database
        await prisma.wallet.create({
            data: {
                address: publicKey,
                userId: userId,
            },
        });

        return NextResponse.json({ isVerified: true, message: 'Wallet verified and added to the database' });
    } catch (error) {
        console.error('Failed to verify wallet', error);
        return NextResponse.json({ isVerified: false, error: 'Verification failed' }, { status: 500 });
    }
}