import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// Full SMS conversation for a customer (chronological), for the operator chat panel.
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  const messages = await prisma.smsMessage.findMany({
    where: { customerId },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      direction: m.direction,
      body: m.body,
      code: m.code,
      at: m.createdAt,
    })),
  });
}
