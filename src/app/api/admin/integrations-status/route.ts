import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { browserbaseConfigured } from "@/lib/browserbase";
import { twilioConfigured } from "@/lib/twilio";

// Read-only health check: reports which integrations the running server can see,
// so we can confirm env vars are live without sending an SMS or starting a browser.
// Returns booleans only — never secret values.
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    browserbase: {
      configured: browserbaseConfigured(),
      proxyCountry: process.env.BROWSERBASE_PROXY_COUNTRY || "CA",
    },
    twilio: {
      configured: twilioConfigured(),
      fromNumberSet: !!process.env.TWILIO_FROM_NUMBER,
      skipValidation: process.env.TWILIO_SKIP_VALIDATION === "true",
    },
    publicBaseUrlSet: !!process.env.PUBLIC_BASE_URL,
  });
}
