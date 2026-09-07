/**
 * Centralized, fail-fast environment access.
 * Single Responsibility: only this module reads process.env for the server.
 * All other modules must import from here (Dependency Inversion: depend on
 * typed config, not on process.env).
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get directUrl() {
    return optional("DIRECT_URL", "");
  },
  get nextAuthSecret() {
    return required("NEXTAUTH_SECRET");
  },
  get nextAuthUrl() {
    return optional("NEXTAUTH_URL", "");
  },
  get githubId() {
    return optional("GITHUB_ID", "");
  },
  get githubSecret() {
    return optional("GITHUB_SECRET", "");
  },
  get googleClientId() {
    return optional("GOOGLE_CLIENT_ID", "");
  },
  get googleClientSecret() {
    return optional("GOOGLE_CLIENT_SECRET", "");
  },
  get publicWalletKey() {
    return optional("NEXT_PUBLIC_WALLET_PUBLIC_KEY", "");
  },
  get solanaRpcUrl() {
    return required("SOLANA_RPC_URL");
  },
  get centralWalletPrivateKey() {
    return required("WALLET_PRIVATE_KEY");
  },
  get r2AccountId() {
    return required("R2_ACCOUNT_ID");
  },
  get r2AccessKeyId() {
    return required("R2_ACCESS_KEY_ID");
  },
  get r2SecretAccessKey() {
    return required("R2_SECRET_ACCESS_KEY");
  },
  get r2BucketName() {
    return required("R2_BUCKET_NAME");
  },
  get r2PublicUrl() {
    return required("R2_PUBLIC_URL").replace(/\/+$/, "");
  },
  get nodeEnv() {
    return optional("NODE_ENV", "development");
  },
  get isProduction() {
    return optional("NODE_ENV") === "production";
  },
};

export const BCRYPT_ROUNDS = 12;
export const MAX_PAGE_SIZE = 50;
export const DEFAULT_PAGE_SIZE = 10;
export const FEED_DEFAULT_PAGE_SIZE = 20;
export const STATEMENT_DEFAULT_TAKE = 200;
export const TOP_SUPPORTERS_LIMIT = 5;
export const PRESIGNED_URL_EXPIRY_SECONDS = 60 * 10;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // 2 GiB guard (enforced via content-length where possible)
export const SOLANA_CONFIRM_TIMEOUT_MS = 30_000;
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_AUTH = 20;
export const RATE_LIMIT_MAX_WALLET = 30;
export const RATE_LIMIT_MAX_WRITE = 60;
export const RATE_LIMIT_MAX_PRESIGNED = 30;
