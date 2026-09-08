'use client';
import { useSession } from 'next-auth/react';
import React, { useId, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { CiHeart } from 'react-icons/ci';
import { toast } from 'sonner';
import { sendThanks } from '../../util/fetch/channel';
import { useBalance } from '../../hooks/useBalance';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { formatDTSolPrecise } from '@/lib/utils';

const LAMPORTS_PER_SOL = 1_000_000_000;

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((m) => m.Player), {
  ssr: false,
});

const ThanksButton = ({ channelId, channelName }: { channelId: number; channelName: string }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { balance, refreshBalance } = useBalance();
  const [amountSol, setAmountSol] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sliderId = useId();
  const safeBalance = balance ?? 0;

  const handleThanks = async () => {
    if (!session) {
      router.push('/logIn');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
      const res = await sendThanks(lamports, session.user.id, channelId);

      if (res.success) {
        setSuccess(true);
        refreshBalance();
      } else {
        const msg = res.message ?? 'Thanks transaction failed';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = 'An error occurred during the transaction.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    if (!session) {
      router.push('/logIn');
      return;
    }
    setError(null);
    setSuccess(false);
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={openModal}
          className="mt-4 w-full rounded-xl"
          aria-label={`Send thanks to ${channelName}`}
        >
          Thanks
          <CiHeart aria-hidden data-icon="inline-end" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thanks: {channelName}</DialogTitle>
          <DialogDescription>Support this channel with DTSol</DialogDescription>
        </DialogHeader>
        <Separator className="my-1" />
        {success ? (
          <div className="my-4 text-center">
            <p className="my-4 text-center text-2xl font-medium text-green-600">
              Sent {amountSol.toFixed(1)} DTSol successfully!
            </p>
            <Player
              autoplay
              loop={false}
              keepLastFrame
              src="/successAnimation.json"
              style={{ height: '200px', width: '200px', margin: '0 auto' }}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setSuccess(false);
              }}
            >
              Send Again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-center text-lg font-medium">
              Available Balance: {formatDTSolPrecise(safeBalance)} DTSol
            </p>
            <div className="flex flex-col gap-2">
              <label htmlFor={sliderId} className="text-sm text-muted-foreground">
                Amount: {amountSol.toFixed(1)} DTSol
              </label>
              <Slider
                id={sliderId}
                min={0}
                max={safeBalance / LAMPORTS_PER_SOL}
                step={0.2}
                value={[amountSol]}
                onValueChange={([v]) => setAmountSol(v ?? 0)}
                aria-label="Thanks amount in DTSol"
              />
            </div>
            {error ? (
              <p role="alert" className="text-center text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button
              variant="destructive"
              onClick={handleThanks}
              disabled={loading || amountSol <= 0 || safeBalance <= 0}
            >
              {loading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Processing…
                </>
              ) : (
                `Send ${amountSol.toFixed(1)} DTSol`
              )}
            </Button>
          </div>
        )}
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            aria-label="Close thanks dialog"
          >
            ✕
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ThanksButton;
