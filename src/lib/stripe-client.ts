import type { Stripe } from "@stripe/stripe-js";

// Lazy, memoized Stripe.js loader. The default "@stripe/stripe-js" entry injects the
// Stripe script the moment it's imported, which put ~3.7MB of Stripe JS on sign-up
// step 1. The /pure entry only injects when loadStripe() is called, and the dynamic
// import keeps the loader out of the step-1 bundle entirely.
let promise: Promise<Stripe | null> | null = null;
export function getStripe(): Promise<Stripe | null> {
  if (!promise) {
    promise = import("@stripe/stripe-js/pure").then((m) =>
      m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    );
  }
  return promise;
}
