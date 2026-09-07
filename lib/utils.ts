import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LAMPORTS_PER_SOL_FALLBACK = 1_000_000_000;

export function formatDTSol(lamports: number | bigint | null | undefined): string {
  if (lamports === null || lamports === undefined) return "0.0";
  const n = typeof lamports === "bigint" ? Number(lamports) : lamports;
  if (!Number.isFinite(n)) return "0.0";
  return (n / LAMPORTS_PER_SOL_FALLBACK).toFixed(1);
}

export function formatDTSolPrecise(
  lamports: number | bigint | null | undefined,
  digits = 2,
): string {
  if (lamports === null || lamports === undefined) return (0).toFixed(digits);
  const n = typeof lamports === "bigint" ? Number(lamports) : lamports;
  if (!Number.isFinite(n)) return (0).toFixed(digits);
  return (n / LAMPORTS_PER_SOL_FALLBACK).toFixed(digits);
}
