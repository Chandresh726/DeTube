import { Connection, PublicKey } from "@solana/web3.js";
import { env } from "./env";

let connection: Connection | undefined;

/** Dependency-inversion seam: routes/services depend on this interface, not web3. */
export interface SolanaGateway {
  getParsedTransfer(args: {
    signature: string;
    expectedRecipient: string;
    expectedLamports: bigint;
    /** Expected sender (deposit wallet). When provided, gateway must verify debit. */
    expectedSender?: string | undefined;
  }): Promise<{ ok: boolean; actualLamports?: bigint | undefined; sender?: string | undefined; reason?: string | undefined }>;
}

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(env.solanaRpcUrl, "confirmed");
  }
  return connection;
}

export class SolanaRpcGateway implements SolanaGateway {
  constructor(private readonly conn: Connection = getConnection()) {}

  async getParsedTransfer({ signature, expectedRecipient, expectedLamports, expectedSender }: {
    signature: string;
    expectedRecipient: string;
    expectedLamports: bigint;
    expectedSender?: string | undefined;
  }): Promise<{ ok: boolean; actualLamports?: bigint | undefined; sender?: string | undefined; reason?: string | undefined }> {
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
    // Sender binding: find account(s) with a debit covering the amount.
    // When expectedSender is provided, require that specific account debited.
    let sender: string | undefined;
    if (expectedSender) {
      const sIdx = keys.indexOf(expectedSender);
      if (sIdx === -1) return { ok: false, actualLamports: credited, reason: "sender not in transaction" };
      const sPre = pre[sIdx];
      const sPost = post[sIdx];
      if (sPre === undefined || sPost === undefined) {
        return { ok: false, actualLamports: credited, reason: "sender balance data missing" };
      }
      const debited = BigInt(sPre) - BigInt(sPost);
      // Debit must cover credited amount (allows fee difference tolerance: debit >= credited).
      if (debited < credited) {
        return { ok: false, actualLamports: credited, reason: "sender did not fund transfer" };
      }
      sender = expectedSender;
    } else {
      // No expected sender: report largest debitor for observability.
      let maxDebit = 0n;
      for (let i = 0; i < keys.length; i++) {
        const a = pre[i];
        const b = post[i];
        if (a === undefined || b === undefined) continue;
        const d = BigInt(a) - BigInt(b);
        if (d > maxDebit) {
          maxDebit = d;
          sender = keys[i];
        }
      }
    }
    return { ok: true, actualLamports: credited, sender };
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
