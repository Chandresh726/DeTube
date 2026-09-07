import { Connection, PublicKey } from "@solana/web3.js";
import { env } from "./env";

let connection: Connection | undefined;

/** Dependency-inversion seam: routes/services depend on this interface, not web3. */
export interface SolanaGateway {
  getParsedTransfer(args: {
    signature: string;
    expectedRecipient: string;
    expectedLamports: bigint;
  }): Promise<{ ok: boolean; actualLamports?: bigint; reason?: string }>;
}

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(env.solanaRpcUrl, "confirmed");
  }
  return connection;
}

export class SolanaRpcGateway implements SolanaGateway {
  constructor(private readonly conn: Connection = getConnection()) {}

  async getParsedTransfer({ signature, expectedRecipient, expectedLamports }: {
    signature: string;
    expectedRecipient: string;
    expectedLamports: bigint;
  }): Promise<{ ok: boolean; actualLamports?: bigint; reason?: string }> {
    const tx = await this.conn.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx?.meta || tx.meta.err) {
      return { ok: false, reason: "transaction failed or not found" };
    }
    const pre = tx.meta.preBalances;
    const post = tx.meta.postBalances;
    const keys = tx.transaction.message.accountKeys.map((k) =>
      typeof k === "string" ? k : (k as { pubkey: PublicKey }).pubkey.toBase58(),
    );
    const idx = keys.indexOf(expectedRecipient);
    if (idx === -1) return { ok: false, reason: "recipient not in transaction" };
    const preVal = pre[idx];
    const postVal = post[idx];
    if (preVal === undefined || postVal === undefined) {
      return { ok: false, reason: "balance data missing" };
    }
    const credited = BigInt(postVal) - BigInt(preVal);
    if (credited < expectedLamports) {
      return { ok: false, actualLamports: credited, reason: "insufficient credited amount" };
    }
    return { ok: true, actualLamports: credited };
  }
}

let gateway: SolanaGateway | undefined;

export function getSolanaGateway(): SolanaGateway {
  if (!gateway) gateway = new SolanaRpcGateway();
  return gateway;
}

/** Test seam. */
export function __setSolanaGateway(g: SolanaGateway | undefined): void {
  gateway = g;
}
