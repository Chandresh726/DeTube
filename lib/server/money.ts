/** Money / BigInt helpers. Wire format for all BigInt is decimal string. */
import { AppError } from './http';

export function toBigInt(value: unknown): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') {
    if (!Number.isInteger(value)) throw new AppError('BAD_REQUEST', 'amount must be an integer');
    return BigInt(value);
  }
  try {
    return BigInt(String(value));
  } catch {
    throw new AppError('BAD_REQUEST', 'Invalid amount encoding');
  }
}

export function bigToString(v: bigint | number): string {
  return typeof v === 'bigint' ? v.toString() : String(v);
}

export function requirePositiveLamports(amount: bigint): bigint {
  if (amount <= 0n) throw new AppError('BAD_REQUEST', 'amount must be positive');
  if (amount > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new AppError('BAD_REQUEST', 'amount exceeds maximum safe value');
  }
  return amount;
}
