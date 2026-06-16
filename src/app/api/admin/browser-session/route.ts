import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getOrCreateSession } from "@/lib/browserbase";

// Starts (or resumes) the persistent remote browser for a customer's telco activation.
// Returns the Live View URL for the operator to drive by hand.
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

  try {
    const session = await getOrCreateSession({ existingContextId: customer.browserbaseContextId });

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        activationStatus: "in_progress",
        // Persist the Context id on first activation so future sessions reuse the trust cookie.
        ...(session.contextId && !customer.browserbaseContextId && { browserbaseContextId: session.contextId }),
      },
    });

    return NextResponse.json({
      liveViewUrl: session.liveViewUrl,
      sessionId: session.sessionId,
      mock: session.mock,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("browser-session failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
