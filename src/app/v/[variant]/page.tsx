import Landing from "@/components/landing/Landing";
import { landingMetadata } from "@/app/landing-metadata";
import { HERO_VARIANTS, type Variant } from "@/lib/experiment";

// Rewrite targets for the hero A/B test — the visitor's URL stays /slash (canonical
// in landingMetadata). Prerendered so each arm is as fast as the static page.
export const metadata = landingMetadata;
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(HERO_VARIANTS).map((variant) => ({ variant }));
}

export default async function VariantPage({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  return <Landing variant={variant as Variant} />;
}
