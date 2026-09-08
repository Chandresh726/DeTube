'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useCallback, useEffect, useState } from 'react';
import bs58 from 'bs58';
import { toast } from 'sonner';
import { checkUserWallet, verifyUserWallet } from '../../util/fetch/wallet';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const ConnectWallet = ({
  setWalletVerified,
  userId,
}: {
  setWalletVerified: (v: boolean) => void;
  userId: number | string;
}) => {
  const { publicKey, connected, signMessage } = useWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const [verified, setVerified] = useState<boolean>(false);

  const isWalletVerified = useCallback(
    async (address: string) => {
      try {
        const res = await checkUserWallet(address, userId);
        if (res.walletExists) {
          setWalletVerified(true);
          setVerified(true);
        }
      } catch {
        // leave unverified
      } finally {
        setLoading(false);
      }
    },
    [userId, setWalletVerified],
  );

  useEffect(() => {
    if (connected && publicKey) {
      setLoading(true);
      setVerified(false);
      setWalletVerified(false);
      isWalletVerified(publicKey.toString());
    }
  }, [connected, publicKey, isWalletVerified, setWalletVerified]);

  const verifyWallet = async () => {
    setLoading(true);
    try {
      if (!publicKey || !signMessage) throw new Error('Wallet not connected');

      const message = `Verify this wallet: ${publicKey.toString()} - ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);

      const signature = await signMessage(encodedMessage);

      const response = await verifyUserWallet(publicKey.toString(), bs58.encode(signature), message, userId);
      if (response.isVerified) {
        setVerified(true);
        setWalletVerified(true);
      } else {
        setWalletVerified(false);
        toast.error('Wallet verification failed');
      }
    } catch (error) {
      toast.error('Failed to verify wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 flex flex-col items-center">
      <div className="flex flex-row items-center gap-2">
        <WalletMultiButton />
        {publicKey ? (
          <Button variant="outline" onClick={() => verifyWallet()} disabled={loading || verified}>
            {loading ? (
              <>
                <Spinner data-icon="inline-start" />
                Verifying…
              </>
            ) : verified ? (
              'Verified'
            ) : (
              'Verify Wallet'
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default ConnectWallet;
