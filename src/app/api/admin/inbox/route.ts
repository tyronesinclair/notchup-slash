import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// Recent inbound customer replies for the dashboard alert inbox. Newest first.
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.smsMessage.findMany({
    where: { direction: "inbound", customerId: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  // SmsMessage has a loose FK — resolve customer names in one query.
  const ids = [...new Set(messages.map((m) => m.customerId).filter(Boolean) as string[])];
  const customers = ids.length
    ? await prisma.customer.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })
    : [];
  const nameById = Object.fromEntries(customers.map((c) => [c.id, c.name]));

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      customerId: m.customerId,
      name: m.customerId ? nameById[m.customerId] ?? "Unknown" : "Unknown",
      body: m.body,
      code: m.code,
      at: m.createdAt,
    })),
  });
}
