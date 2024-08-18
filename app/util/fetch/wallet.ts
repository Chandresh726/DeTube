export const getUserBalance = async (id: Number) => {
    const response = await fetch(`/api/wallet/balance?id=${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch balance data');
    }
    return await response.json();
}

export const verifyUserWallet = async (publicKey: String, signature: String, message: String, userId: Number) => {
    const response = await fetch('/api/wallet/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            publicKey,
            signature,
            message,
            userId
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to verify wallet');
    }
    return await response.json();
}

export const checkUserWallet = async (publicKey: String, userId: Number) => {
    const response = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            publicKey,
            userId
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to verify wallet');
    }
    return await response.json();
}

export const depositRequest = async (address: String, amount: Number, signature: String) => {
    const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            address,
            amount,
            signature
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to deposit');
    }
    return await response.json();
}

export const withdrawRequest = async (walletAddress: String, amount: Number, userId: Number) => {
    const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            walletAddress,
            amount
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to withdraw');
    }
    return await response.json();
}