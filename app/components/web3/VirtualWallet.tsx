'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoMdArrowRoundDown, IoMdArrowRoundUp } from 'react-icons/io';
import { useBalance } from '../../hooks/useBalance';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDTSol } from '@/lib/utils';

const VirtualWallet = () => {
  const router = useRouter();
  const { balance } = useBalance();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <Card className="m-2 mb-2 py-0">
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-3 py-2">
        <Link
          href="/statement"
          className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CardTitle className="text-xs font-medium text-muted-foreground">Current balance</CardTitle>
          <div className="text-2xl font-bold">{formatDTSol(balance)} DTSol</div>
        </Link>
        <Button
          onClick={() => setIsExpanded((v) => !v)}
          variant="ghost"
          size="icon"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse wallet' : 'Expand wallet'}
        >
          {isExpanded ? <IoMdArrowRoundDown aria-hidden /> : <IoMdArrowRoundUp aria-hidden />}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="mx-1 flex justify-between gap-2 px-2 pb-3">
          <Button
            size="sm"
            onClick={() => {
              router.push('/deposit');
            }}
          >
            Deposit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              router.push('/withdraw');
            }}
            disabled={(balance ?? 0) <= 0}
          >
            Withdraw
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default VirtualWallet;
