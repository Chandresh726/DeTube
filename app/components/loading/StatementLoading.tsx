"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const sections = ['Deposit Transactions', 'Withdraw Transactions', 'Thanks Transactions'];

const StatementLoading = () => {
  return (
    <div aria-busy="true" aria-label="Loading transactions">
      <div className="my-2 text-center text-3xl font-bold">Your Transactions</div>
      <div className="flex flex-col gap-4">
        {sections.map((title) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-xl font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Separator className="my-1" />
              <Skeleton className="my-2 h-8 w-full" />
              <Skeleton className="my-2 h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatementLoading;
