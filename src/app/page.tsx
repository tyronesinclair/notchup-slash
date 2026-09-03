import Landing from "@/components/landing/Landing";
import { landingMetadata } from "./landing-metadata";

export const metadata = landingMetadata;

// The proxy (src/proxy.ts) rewrites "/" to /v/{a|b} per visitor; this route is the
// control fallback if it ever doesn't run.
export default function Home() {
  return <Landing variant="a" />;
}
