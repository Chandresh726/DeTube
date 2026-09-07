/** Money / BigInt helpers. Wire format for all BigInt is decimal string. */

export function toBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isInteger(value)) throw new Error("amount must be an integer");
    return BigInt(value);
  }
  return BigInt(String(value));
}

export function bigToString(v: bigint | number): string {
  return typeof v === "bigint" ? v.toString() : String(v);
}

export function requirePositiveLamports(amount: bigint): bigint {
  if (amount <= 0n) throw new Error("amount must be positive");
  if (amount > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("amount exceeds maximum safe value");
  }
  return amount;
}
