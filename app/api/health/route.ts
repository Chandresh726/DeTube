import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "detube-backend", ts: new Date().toISOString() });
}
