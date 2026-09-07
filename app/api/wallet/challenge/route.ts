import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { handleRouteError } from "@/lib/server/http";
import { issueWalletChallenge } from "@/lib/server/services/wallet";
import { rateLimitByUser } from "@/lib/server/rate-limit";
import { RATE_LIMIT_MAX_WALLET } from "@/lib/server/env";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireSession();
    rateLimitByUser("wallet:challenge", userId, RATE_LIMIT_MAX_WALLET);
    void req.url;
    return NextResponse.json(issueWalletChallenge(userId));
  } catch (error) {
    return handleRouteError(error, "GET /api/wallet/challenge");
  }
}
