import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Money helpers moved to lib/format.ts (kept here for back-compat).
export { formatDTSol, formatDTSolPrecise } from './format';
