/** Money formatting (client-safe). Import from here, not lib/utils. */
const LAMPORTS_PER_SOL = 1_000_000_000;

function toNumber(lamports: number | bigint | string | null | undefined): number | null {
  if (lamports === null || lamports === undefined) return null;
  const n =
    typeof lamports === 'bigint'
      ? Number(lamports)
      : typeof lamports === 'string'
        ? Number(lamports)
        : lamports;
  return Number.isFinite(n) ? n : null;
}

export function formatDTSol(lamports: number | bigint | string | null | undefined): string {
  const n = toNumber(lamports);
  if (n === null) return '0.0';
  return (n / LAMPORTS_PER_SOL).toFixed(1);
}

export function formatDTSolPrecise(
  lamports: number | bigint | string | null | undefined,
  digits = 2,
): string {
  const n = toNumber(lamports);
  if (n === null) return (0).toFixed(digits);
  return (n / LAMPORTS_PER_SOL).toFixed(digits);
}
