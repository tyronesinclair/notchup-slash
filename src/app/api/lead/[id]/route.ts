import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Prefill for resume links (?lead=<cuid>). Ids are unguessable; returns only name + email.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]{10,40}$/i.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const lead = await prisma.lead.findUnique({ where: { id }, select: { name: true, email: true } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead, { headers: { "Cache-Control": "no-store" } });
}
