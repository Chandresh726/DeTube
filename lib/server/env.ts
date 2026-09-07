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
  get nextAuthSecret() {
    return required("NEXTAUTH_SECRET");
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
export const TOP_SUPPORTERS_LIMIT = 5;
export const PRESIGNED_URL_EXPIRY_SECONDS = 60 * 10;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // 2 GiB guard (enforced via content-length where possible)
