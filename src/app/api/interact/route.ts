// src/app/api/interact/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // optional: read body for debugging
    // const body = await req.json().catch(() => null);
    // console.log("[interact] body=", body);

    // For dev, respond 204 No Content quickly
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
