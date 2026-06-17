import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { getProviderLogin, canAutoVerify } from "@/lib/providers";
import { verifyCredentials } from "@/lib/verify-creds";

// SPIKE endpoint: run automated credential verification on demand to tune it against
// real (non-Rogers) accounts. Accepts either a customerId (uses stored creds) or an
// ad-hoc { loginUrl, username, password }.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Ad-hoc mode: explicit creds + url.
  if (body.loginUrl && body.username && body.password) {
    const result = await verifyCredentials({ loginUrl: body.loginUrl, username: body.username, password: body.password });
    return NextResponse.json({ mode: "adhoc", result });
  }

  // Customer mode: use the customer's stored creds + their provider's login URL.
  const { customerId } = body;
  if (!customerId) {
    return NextResponse.json({ error: "Provide customerId, or loginUrl+username+password" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { services: true },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const service = customer.services[0];
  const provider = service?.provider;
  if (!service?.encryptedCredentials) {
    return NextResponse.json({ error: "No credentials on file for this customer" }, { status: 400 });
  }

  if (!canAutoVerify(provider)) {
    return NextResponse.json({
      mode: "customer",
      provider,
      result: { status: "manual", detail: `${provider ?? "This provider"} is not auto-verified — falls back to the manual operator flow.` },
    });
  }

  let creds: { username: string; password: string };
  try {
    creds = JSON.parse(decrypt(service.encryptedCredentials));
  } catch {
    return NextResponse.json({ error: "Could not decrypt credentials" }, { status: 500 });
  }

  const login = getProviderLogin(provider);
  const result = await verifyCredentials({
    loginUrl: login!.loginUrl,
    username: creds.username,
    password: creds.password,
  });

  return NextResponse.json({ mode: "customer", provider, result });
}
