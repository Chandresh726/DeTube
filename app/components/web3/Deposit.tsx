'use client';
import React, { useState, useEffect, useId } from 'react';
import dynamic from 'next/dynamic';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { toast } from 'sonner';
import ConnectWallet from './ConnectWallet';
import { depositRequest } from '../../util/fetch/wallet';
import { useBalance } from '../../hooks/useBalance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

const LAMPORTS_PER_SOL = 1_000_000_000;

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((m) => m.Player), {
  ssr: false,
});

const Deposit = ({ session }: { session: { user: { id: number | string } } }) => {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [walletVerified, setWalletVerified] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const { refreshBalance } = useBalance();
  const [amountSol, setAmountSol] = useState<number>(0);
  const [textValue, setTextValue] = useState<string>('0.0');
  const [loading, setLoading] = useState<boolean>(false);
  const [showAirdrop, setShowAirdrop] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalType, setModalType] = useState<'success' | 'failure'>('success');
  const amountId = useId();

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance(publicKey.toString());
    }
  }, [connected, publicKey]);

  const fetchBalance = async (address: string) => {
    try {
      const key = new web3.PublicKey(address);
      const balanceLamports = await connection.getBalance(key);
      setWalletBalance(balanceLamports);
      setShowAirdrop(balanceLamports < LAMPORTS_PER_SOL);
    } catch (error) {
      toast.error('Failed to fetch wallet balance');
    }
  };

  const syncAmount = (sol: number) => {
    const clamped = Math.max(0, Math.min(sol, walletBalance / LAMPORTS_PER_SOL));
    setAmountSol(clamped);
    setTextValue(clamped.toFixed(1));
  };

  const handleDeposit = async () => {
    if (!publicKey || !walletVerified) return;

    setLoading(true);
    try {
      const transaction = new web3.Transaction();
      const recipientPubKey = new web3.PublicKey(process.env.NEXT_PUBLIC_WALLET_PUBLIC_KEY as string);
      const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
      const sendSolInstruction = web3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPubKey,
        lamports,
      });
      transaction.add(sendSolInstruction);

      const signature = await sendTransaction(transaction, connection);
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });

      const res = await depositRequest(publicKey.toString(), lamports, signature);
      if (res.success) {
        refreshBalance();
        setModalMessage('Your deposit was processed successfully.');
        setModalType('success');
      } else {
        setModalMessage(`Deposit failed: ${res.message ?? 'unknown error'}`);
        setModalType('failure');
      }
    } catch (error) {
      setModalMessage('An error occurred during the deposit process.');
      setModalType('failure');
    } finally {
      if (publicKey) fetchBalance(publicKey.toString());
      setModalOpen(true);
      setLoading(false);
      syncAmount(0);
    }
  };

  const maxSol = walletBalance / LAMPORTS_PER_SOL;

  return (
    <Card className="mx-auto mt-10 max-w-md">
      <CardHeader>
        <CardTitle>Deposit SOL</CardTitle>
        <CardDescription>Top up your DeTube balance</CardDescription>
      </CardHeader>
      <CardContent>
        <ConnectWallet setWalletVerified={setWalletVerified} userId={session?.user.id} />
        <Separator className="my-2" />
        {connected && walletVerified ? (
          <FieldGroup>
            <p className="text-center text-lg font-medium">
              Wallet Balance: {(walletBalance / LAMPORTS_PER_SOL).toFixed(2)} SOL
            </p>
            {showAirdrop && (
              <p className="text-center text-sm text-destructive">
                Your wallet balance is low.{' '}
                <a className="underline" target="_blank" rel="noreferrer" href="https://faucet.solana.com/">
                  Get AirDrop
                </a>
              </p>
            )}
            <Field>
              <FieldLabel htmlFor={amountId}>Amount (SOL)</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id={amountId}
                  type="text"
                  inputMode="decimal"
                  value={textValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || /^\d*\.?\d*$/.test(v)) {
                      setTextValue(v);
                      const n = parseFloat(v);
                      if (!Number.isNaN(n)) setAmountSol(Math.min(n, maxSol));
                    }
                  }}
                  onBlur={() => {
                    const n = parseFloat(textValue);
                    if (Number.isNaN(n) || n < 0) syncAmount(0);
                    else syncAmount(Math.floor(n * 10) / 10);
                  }}
                  placeholder="Enter amount to deposit"
                />
                <Button type="button" variant="secondary" onClick={() => syncAmount(maxSol)}>
                  Max
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">0.1 SOL increments, up to your wallet balance.</p>
            </Field>
            <Slider
              min={0}
              max={maxSol}
              step={0.1}
              value={[amountSol]}
              onValueChange={([v]) => syncAmount(v ?? 0)}
              aria-label="Deposit amount in SOL"
            />
            <Button onClick={handleDeposit} disabled={loading || amountSol <= 0}>
              {loading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Processing…
                </>
              ) : (
                `Deposit ${amountSol.toFixed(1)} SOL`
              )}
            </Button>
          </FieldGroup>
        ) : (
          <p className="text-sm text-muted-foreground">Please connect and verify your wallet to deposit.</p>
        )}

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className={modalType === 'success' ? 'text-green-600' : 'text-destructive'}>
                {modalType === 'success' ? 'Success!' : 'Failure!'}
              </DialogTitle>
              <DialogDescription>{modalMessage}</DialogDescription>
            </DialogHeader>
            <Player
              autoplay
              loop={false}
              keepLastFrame
              src={modalType === 'success' ? '/successAnimation.json' : '/failureAnimation.json'}
              style={{ height: '200px', width: '200px', margin: '0 auto' }}
            />
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default Deposit;
