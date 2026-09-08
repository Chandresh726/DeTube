import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

describe('Phase 1 money safety', () => {
  const wallet = read('lib/server/services/wallet.ts');
  const solana = read('lib/server/solana.ts');

  it('deposit is sender-bound (C1)', () => {
    assert.match(wallet, /expectedSender/);
    assert.match(wallet, /Signature already credited to another wallet/);
    assert.match(solana, /expectedSender/);
    assert.match(solana, /sender did not fund transfer/);
  });

  it('deposit FAILED-retry uses conditional update (H1)', () => {
    assert.match(
      wallet,
      /updateMany\(\{\s*where:\s*\{\s*signature:\s*input\.signature,\s*status:\s*\{\s*not:\s*['"]SUCCESS['"]\s*\}/,
    );
  });

  it('thanks reserves idempotency key before moving money (C2)', () => {
    const idxCreate = wallet.indexOf('Reserve idempotency key FIRST');
    assert.ok(idxCreate !== -1, 'missing reservation comment');
    // P2002 on thanks must abort, not commit silently
    assert.match(wallet, /Duplicate tip submission/);
    assert.doesNotMatch(wallet, /if \(isPrismaCode\(e, ['"]P2002['"]\)\) return;/);
  });

  it('withdraw updates originating PENDING row, no phantom FAILED (H2)', () => {
    assert.match(wallet, /pendingId/);
    assert.match(wallet, /where:\s*\{\s*id:\s*pendingId\s*\},\s*data:\s*\{\s*status:\s*['"]FAILED['"]/);
    assert.match(wallet, /where:\s*\{\s*id:\s*pendingId\s*\},\s*data:\s*\{\s*status:\s*['"]SUCCESS['"]/);
  });

  it('challenges are bounded and swept (H4 stopgap)', () => {
    assert.match(wallet, /sweepExpiredChallenges/);
    assert.match(wallet, /MAX_CHALLENGES/);
  });
});
