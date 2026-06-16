import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { deleteContext } from "@/lib/browserbase";

// Wipes a customer's persistent browser context so the next activation starts with a
// clean browser (clears stale cookies/auth state that cause errors like Rogers RC01).
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId } = await req.json();
  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  if (customer.browserbaseContextId) {
    await deleteContext(customer.browserbaseContextId);
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { browserbaseContextId: null },
  });

  return NextResponse.json({ ok: true });
}
