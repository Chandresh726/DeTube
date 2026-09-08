export const getUserBalance = async (id: number | string) => {
  const response = await fetch(`/api/wallet/balance?id=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch balance data');
  }
  return await response.json();
};

export const getUserStatement = async (id: number | string) => {
  const response = await fetch(`/api/wallet/statement?id=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch balance data');
  }
  return await response.json();
};

export const verifyUserWallet = async (
  publicKey: string,
  signature: string,
  message: string,
  userId: number | string,
) => {
  const response = await fetch('/api/wallet/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey,
      signature,
      message,
      userId,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to verify wallet');
  }
  return await response.json();
};

export const checkUserWallet = async (publicKey: string, userId: number | string) => {
  const response = await fetch('/api/wallet/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey,
      userId,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to verify wallet');
  }
  return await response.json();
};

export const depositRequest = async (address: string, amount: number | string, signature: string) => {
  const response = await fetch('/api/wallet/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address,
      amount,
      signature,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to deposit');
  }
  return await response.json();
};

export const withdrawRequest = async (
  walletAddress: string,
  amount: number | string,
  userId: number | string,
  idempotencyKey?: string,
) => {
  const response = await fetch('/api/wallet/withdraw', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
    },
    body: JSON.stringify({
      userId,
      walletAddress,
      amount,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to withdraw');
  }
  return await response.json();
};
