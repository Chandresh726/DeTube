'use client';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addSubscription, checkIfSubscribed } from '../../util/fetch/subscription';
import { Button } from '@/components/ui/button';

const SubscribeButton = ({ channelId }: { channelId: number }) => {
  const { data: session } = useSession();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const checkSubscription = async () => {
      if (session?.user?.id) {
        try {
          const data = await checkIfSubscribed(session.user.id, channelId);
          if (!cancelled) setIsSubscribed(Boolean(data));
        } catch {
          // keep default unsubscribed on failure
        }
      }
    };
    checkSubscription();
    return () => {
      cancelled = true;
    };
  }, [session, channelId]);

  const handleSubscribe = async () => {
    if (!session) {
      router.push('/logIn');
      return;
    }
    const previous = isSubscribed;
    const next = !previous;
    setIsSubscribed(next);
    setPending(true);
    try {
      await addSubscription(session.user.id, channelId, previous ? 'unsub' : 'sub');
    } catch {
      setIsSubscribed(previous);
      toast.error('Subscription update failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={pending}
      variant={isSubscribed ? 'secondary' : 'destructive'}
      className="mt-4 w-full rounded-xl"
      aria-pressed={isSubscribed}
    >
      {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
    </Button>
  );
};

export default SubscribeButton;
