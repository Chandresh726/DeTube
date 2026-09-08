'use client';
import React, { useState, useId } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import ConnectWallet from './ConnectWallet';
import { withdrawRequest } from '../../util/fetch/wallet';
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
import { formatDTSolPrecise } from '@/lib/utils';

const LAMPORTS_PER_SOL = 1_000_000_000;

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((m) => m.Player), {
  ssr: false,
});

const Withdraw = ({ session }: { session: { user: { id: number | string } } }) => {
  const { publicKey, connected } = useWallet();
  const [walletVerified, setWalletVerified] = useState<boolean>(false);
  const { balance, refreshBalance } = useBalance();
  const [amountSol, setAmountSol] = useState<number>(0);
  const [textValue, setTextValue] = useState<string>('0.0');
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalType, setModalType] = useState<'success' | 'failure'>('success');
  const amountId = useId();
  const safeBalance = balance ?? 0;
  const maxSol = safeBalance / LAMPORTS_PER_SOL;

  const syncAmount = (sol: number) => {
    const clamped = Math.max(0, Math.min(sol, maxSol));
    setAmountSol(clamped);
    setTextValue(clamped.toFixed(1));
  };

  const handleWithdraw = async () => {
    if (!publicKey || !walletVerified || amountSol <= 0) return;

    setLoading(true);
    try {
      const res = await withdrawRequest(
        publicKey.toString(),
        Math.round(amountSol * LAMPORTS_PER_SOL),
        session.user.id,
      );
      if (res.success) {
        refreshBalance();
        setModalMessage('Your withdrawal was processed successfully.');
        setModalType('success');
      } else {
        setModalMessage(`Withdrawal failed: ${res.message ?? 'unknown error'}`);
        setModalType('failure');
      }
    } catch (error) {
      setModalMessage('An error occurred during the withdrawal process.');
      setModalType('failure');
      toast.error('Withdrawal failed');
    } finally {
      setModalOpen(true);
      setLoading(false);
      syncAmount(0);
    }
  };

  return (
    <Card className="mx-auto mt-10 max-w-md">
      <CardHeader>
        <CardTitle>Withdraw DTSol</CardTitle>
        <CardDescription>Move funds back to your Solana wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <ConnectWallet setWalletVerified={setWalletVerified} userId={session?.user.id} />
        <Separator className="my-2" />
        {connected && walletVerified ? (
          <FieldGroup>
            <p className="text-center text-lg font-medium">
              Available Balance: {formatDTSolPrecise(safeBalance)} DTSol
            </p>
            <Field>
              <FieldLabel htmlFor={amountId}>Amount (DTSol)</FieldLabel>
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
                  placeholder="Enter amount to withdraw"
                />
                <Button type="button" variant="secondary" onClick={() => syncAmount(maxSol)}>
                  Max
                </Button>
              </div>
            </Field>
            <Slider
              min={0}
              max={maxSol}
              step={0.1}
              value={[amountSol]}
              onValueChange={([v]) => syncAmount(v ?? 0)}
              aria-label="Withdraw amount in DTSol"
            />
            <Button onClick={handleWithdraw} disabled={loading || amountSol <= 0}>
              {loading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Processing…
                </>
              ) : (
                `Withdraw ${amountSol.toFixed(1)} DTSol`
              )}
            </Button>
          </FieldGroup>
        ) : (
          <p className="text-sm text-muted-foreground">Please connect and verify your wallet to withdraw.</p>
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

export default Withdraw;
