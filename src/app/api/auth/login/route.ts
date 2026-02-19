import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "admin888").trim();

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (username === "admin" && password === ADMIN_PASSWORD) {
      return NextResponse.json({ ok: true, user: username });
    }

    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
