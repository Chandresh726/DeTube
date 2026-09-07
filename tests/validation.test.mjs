import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

describe("prisma schema hardening", () => {
  const schema = read("prisma/schema.prisma");
  it("has composite indexes for hot paths", () => {
    assert.match(schema, /\@\@index\(\[createdAt\]\)/);
    assert.match(schema, /\@\@index\(\[channelId,\s*createdAt\]\)/);
    assert.match(schema, /\@\@index\(\[videoId,\s*type\]\)/);
    assert.match(schema, /\@\@index\(\[videoId,\s*createdAt\]\)/);
    assert.match(schema, /\@\@index\(\[userId,\s*createdAt\]\)/);
    assert.match(schema, /\@\@index\(\[channelId,\s*type,\s*status\]\)/);
  });
  it("renames User.Transaction to transactions and adds idempotencyKey", () => {
    assert.match(schema, /transactions\s+Transaction\[\]/);
    assert.doesNotMatch(schema, /^\s*Transaction\s+Transaction\[\]/m);
    assert.match(schema, /idempotencyKey\s+String\?\s+\@unique/);
  });
  it("uses Restrict for money trail and channel owner", () => {
    assert.match(schema, /Channel[\s\S]*onDelete:\s*Restrict/);
    assert.match(schema, /model Transaction[\s\S]*onDelete:\s*Restrict/);
  });
  it("migration SQL exists", () => {
    const dir = path.join(root, "prisma/migrations/20260907220116_backend_hardening");
    assert.ok(fs.existsSync(path.join(dir, "migration.sql")));
  });
});

describe("backend layering", () => {
  it("services import from lib/server/db, not app/api", () => {
    for (const f of [
      "lib/server/services/videos.ts",
      "lib/server/services/channels.ts",
      "lib/server/services/social.ts",
      "lib/server/services/wallet.ts",
      "app/util/auth.ts",
    ]) {
      const src = read(f);
      assert.doesNotMatch(src, /app\/api\/util\/prisma/);
      assert.match(src, /(lib\/server\/db|from "\.\.\/db"|from "\@\/lib\/server\/db")/);
    }
  });
  it("dead legacy shims deleted", () => {
    for (const f of [
      "lib/server/repos.ts",
      "app/api/util/r2.ts",
      "app/api/util/util.ts",
      "app/api/middleware/auth.ts",
      "app/types/next-auth.d.ts",
    ]) {
      assert.ok(!fs.existsSync(path.join(root, f)), `${f} should be deleted`);
    }
  });
  it("no dynamic prisma/presenter imports in services", () => {
    for (const f of ["lib/server/services/social.ts", "lib/server/services/wallet.ts"]) {
      assert.doesNotMatch(read(f), /await import\(/);
    }
  });
  it("single next-auth augmentation", () => {
    assert.ok(fs.existsSync(path.join(root, "types/next-auth.d.ts")));
    assert.ok(!fs.existsSync(path.join(root, "app/types/next-auth.d.ts")));
  });
});

describe("validation + auth hardening", () => {
  const v = read("lib/server/validation.ts");
  it("uses shared base58/legacy helpers and strict lamports", () => {
    assert.match(v, /legacyUserId/);
    assert.match(v, /publicKeyString/);
    assert.match(v, /isBase58/);
    assert.match(v, /Number\.isInteger/);
  });
  it("withdraw/thanks support idempotency keys", () => {
    assert.match(v, /idempotencyKey/);
  });
  it("ownership guards reject hex/scientific/octal strings", () => {
    const auth = read("lib/server/auth.ts");
    assert.match(auth, /assertQueryOwnership/);
    assert.match(auth, /\^\\d\+\$/);
  });
  it("storage blocks svg/active mime", () => {
    const s = read("lib/server/storage.ts");
    assert.match(s, /svg\+xml/);
  });
  it("wallet reuses connection + caches vault key + has challenge", () => {
    const w = read("lib/server/services/wallet.ts");
    assert.match(w, /getConnection\(\)/);
    assert.doesNotMatch(w, /new web3\.Connection\(env\.solanaRpcUrl/);
    assert.match(w, /getCentralKeypair| cachedCentral/i);
    assert.match(w, /issueWalletChallenge/);
  });
  it("http no longer regex-sniffs library messages", () => {
    assert.doesNotMatch(read("lib/server/http.ts"), /non-base58/);
  });
});

describe("api safeguards", () => {
  it("money routes rate-limited and deposit has no duplicate lookup", () => {
    assert.match(read("app/api/wallet/deposit/route.ts"), /rateLimitByUser/);
    assert.doesNotMatch(read("app/api/wallet/deposit/route.ts"), /api\/util\/prisma/);
    assert.match(read("app/api/wallet/withdraw/route.ts"), /idempotencyKey/);
    assert.match(read("app/api/channel/thanks/route.ts"), /rateLimitByUser/);
    assert.match(read("app/api/getPresignedUrl/route.ts"), /rateLimitByUser/);
    assert.match(read("app/api/auth/register/route.ts"), /rateLimitByIp/);
  });
  it("self-scoped GETs use assertQueryOwnership", () => {
    for (const f of [
      "app/api/wallet/balance/route.ts",
      "app/api/wallet/statement/route.ts",
      "app/api/video/liked/route.ts",
      "app/api/subscriptions/data/route.ts",
      "app/api/subscriptions/data/video/route.ts",
    ]) {
      assert.match(read(f), /assertQueryOwnership/);
      assert.doesNotMatch(read(f), /Number\(id\) !==/);
    }
  });
  it("health + challenge endpoints exist", () => {
    assert.ok(fs.existsSync(path.join(root, "app/api/health/route.ts")));
    assert.ok(fs.existsSync(path.join(root, "app/api/wallet/challenge/route.ts")));
  });
});
