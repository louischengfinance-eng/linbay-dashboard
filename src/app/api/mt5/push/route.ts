import { NextRequest, NextResponse } from "next/server";
import { kvSet, kvAppendDaily } from "@/lib/kv";

const AUTH_TOKEN = process.env.MT5_AUTH_TOKEN || "nexus2026";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${AUTH_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Save latest snapshot
    await kvSet("mt5:latest", body);

    // Append to daily log
    const today = new Date().toISOString().slice(0, 10);
    await kvAppendDaily(today, { ...body, receivedAt: Date.now() });

    console.log(
      `[MT5] Push #${body.pushCount || "?"} | ` +
      `Balance: ${body.account?.balance} | ` +
      `Positions: ${body.positions?.length || 0} | ` +
      `History: ${body.history?.length || 0}`
    );

    return NextResponse.json({
      ok: true,
      received: Date.now(),
      pushCount: body.pushCount,
    });
  } catch (e: any) {
    console.error("[MT5] Push error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET: return latest snapshot
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${AUTH_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { kvGet } = await import("@/lib/kv");
    const data = await kvGet("mt5:latest");
    if (!data) return NextResponse.json({ error: "No data yet" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "No data yet" }, { status: 404 });
  }
}
