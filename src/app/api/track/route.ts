import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { event, sessionId, meta } = await req.json();
    if (!event) return NextResponse.json({ ok: false }, { status: 400 });

    await prisma.analyticsEvent.create({
      data: {
        event,
        sessionId: sessionId ?? null,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Non-critical — swallow errors so tracking never breaks the user flow
    return NextResponse.json({ ok: false });
  }
}
