"use client";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useEffect, useState } from 'react';
import * as bs58 from 'bs58';
import { checkUserWallet, verifyUserWallet } from '../../util/fetch/wallet';

const ConnectWallet = ({ setWalletVerified, userId }) => {
    const { publicKey, connected, signMessage } = useWallet();
    const [loading, setLoading] = useState<boolean>(true);
    const [verified, setVerified] = useState<boolean>(false);

    useEffect(() => {
        if (connected && publicKey) {
            setLoading(true);
            setVerified(false);
            setWalletVerified(false);
            isWalletVerified(publicKey.toString());
        }
    }, [connected, publicKey]);

    const verifyWallet = async () => {
        setLoading(true);
        try {
            if (!publicKey || !signMessage) throw new Error('Wallet not connected');

            // Generate a unique message to sign (this could come from the backend)
            const message = `Verify this wallet: ${publicKey.toString()} - ${Date.now()}`;
            const encodedMessage = new TextEncoder().encode(message);

            // Sign the message
            const signature = await signMessage(encodedMessage);

            // Send the signature and public key to the backend for verification
            const response = await verifyUserWallet(publicKey.toString(), bs58.encode(signature), message, userId)
            if (response.isVerified) {
                setVerified(true)
                setWalletVerified(true);
            } else {
                setWalletVerified(false);
            }
        } catch (error) {
            console.error('Failed to verify wallet', error);
        } finally {
            setLoading(false);
        }
    };

    const isWalletVerified = async (address: string) => {
        const res = await checkUserWallet(address, userId);
        if (res.walletExists) {
            setWalletVerified(true);
            setVerified(true);
        }
        setLoading(false);
    }

    return (
        <div className="flex flex-col items-center mb-4">
            <div className='flex flex-row items-center'>
                <WalletMultiButton />
                <button
                    className={`btn btn-outline btn-success mx-2 ${publicKey ? 'display' : 'hidden'}`}
                    onClick={() => verifyWallet()}
                    disabled={loading || verified}
                >
                    {loading ? 'Verifying...' : (verified ? 'Verified' : 'Verify Wallet')}
                </button>
            </div>
        </div>
    );
};

export default ConnectWallet;