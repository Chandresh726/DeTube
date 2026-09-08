import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

describe("Phase 2 API robustness", () => {
  it("unbounded pagination removed from routes", () => {
    for (const f of ["app/api/video/liked/route.ts", "app/api/subscriptions/data/route.ts", "app/api/wallet/statement/route.ts"]) {
      const src = read(f);
      assert.match(src, /paginationSchema/);
      assert.doesNotMatch(src, /Number\(pageParam\)/);
      assert.doesNotMatch(src, /Number\(limitParam\)/);
    }
  });
  it("services clamp and always paginate", () => {
    for (const f of ["lib/server/services/channels.ts", "lib/server/services/videos.ts", "lib/server/services/social.ts", "lib/server/services/wallet.ts"]) {
      assert.match(read(f), /MAX_PAGE_SIZE/);
    }
    assert.doesNotMatch(read("lib/server/services/channels.ts"), /paginated \?/);
    assert.doesNotMatch(read("lib/server/services/videos.ts"), /paginated \?/);
  });
  it("rate limiter bounded + read-tier limits present", () => {
    assert.match(read("lib/server/rate-limit.ts"), /MAX_BUCKETS/);
    assert.match(read("lib/server/rate-limit.ts"), /__resetRateLimits/);
    assert.match(read("app/api/video/data/route.ts"), /rateLimitByIp/);
    assert.match(read("app/api/video/home/route.ts"), /rateLimitByIp/);
  });
  it("upload size enforced + deprecated prisma deleted", () => {
    assert.match(read("lib/server/validation.ts"), /MAX_UPLOAD_BYTES_BY_FILE_TYPE/);
    assert.match(read("app/api/getPresignedUrl/route.ts"), /File too large/);
    assert.match(read("lib/server/storage.ts"), /ContentLength/);
    assert.match(read("lib/server/storage.ts"), /CacheControl/);
    assert.ok(!exists("app/api/util/prisma.ts"), "deprecated prisma path should be deleted");
  });
});

describe("Phase 3-5 UI + structure", () => {
  it("SSR restored (no ssr:false wrapper)", () => {
    assert.ok(!exists("app/components/wrapper/DynamicNavBarWrapper.tsx"));
    assert.doesNotMatch(read("app/layout.tsx"), /DynamicNavBarWrapper/);
    assert.match(read("app/layout.tsx"), /NavBarWrapper/);
  });
  it("theming uses next-themes", () => {
    assert.match(read("app/components/wrapper/Provider.tsx"), /next-themes/);
  });
  it("pages have error states, channel dep fixed", () => {
    assert.match(read("app/video/[id]/page.tsx"), /Retry/);
    assert.match(read("app/channel/[id]/page.tsx"), /\[channelId\]/);
    assert.match(read("app/channel/[id]/page.tsx"), /Retry/);
  });
  it("forms gate navigation on success only", () => {
    assert.doesNotMatch(read("app/components/form/uploadVideoForm.tsx"), /let redirectPath/);
    assert.doesNotMatch(read("app/components/form/createChannelForm.tsx"), /let redirectPath/);
    assert.match(read("app/components/form/uploadVideoForm.tsx"), /crypto\.randomUUID/);
  });
  it("thumbnails use next/image, avatars centralized", () => {
    assert.match(read("app/components/video/VideoCard.tsx"), /from 'next\/image'|from "next\/image"/);
    assert.doesNotMatch(read("app/components/video/VideoCard.tsx"), /no-img-element/);
    assert.match(read("lib/constants.ts"), /DEFAULT_AVATAR/);
    assert.doesNotMatch(read("app/components/nav/NavbarRight.tsx"), /vecteezy/);
  });
  it("dead deps removed, sitemap public-only, strict mode on", () => {
    const pkg = JSON.parse(read("package.json"));
    for (const d of ["cn", "uuid", "@radix-ui/react-dialog", "@radix-ui/react-slot"]) {
      assert.ok(!(d in (pkg.dependencies ?? {})), `${d} should be removed`);
    }
    assert.doesNotMatch(read("app/sitemap.ts"), /\/deposit/);
    assert.match(read("next.config.mjs"), /reactStrictMode:\s*true/);
    assert.match(read("next.config.mjs"), /optimizePackageImports/);
    assert.ok(!exists("components/ui/switch.tsx"), "unused switch should be deleted");
  });
  it("perf: Lottie dynamic, no web3 LAMPORTS barrel in UI", () => {
    for (const f of ["app/components/button/ThanksBtn.tsx", "app/components/web3/Deposit.tsx", "app/components/web3/Withdraw.tsx"]) {
      assert.match(read(f), /dynamic\(.*lottie-player/i);
      assert.doesNotMatch(read(f), /from '@solana\/web3\.js'/);
    }
  });
});
