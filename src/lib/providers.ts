// Telco login pages, keyed by the provider names used in the signup form
// (see src/components/signup/ServicesStep.tsx). Edit these as the telcos change
// their login URLs. `getProviderLogin` matches case/space-insensitively and tolerates
// common aliases, so "Freedom Mobile", "freedom", etc. all resolve.
//
// NOTE: verify each URL against the live telco site — they move these occasionally.

export type ProviderLogin = {
  name: string;       // canonical display name
  loginUrl: string;   // page the operator should open to sign in
  notes?: string;     // anything the operator should know (redirects, app-only, etc.)
  // Whether the automated bot can verify credentials for this provider. Rogers uses
  // Transmit Security + aggressive Akamai bot detection that blocks automation, so it
  // falls back to the manual operator flow. Default true for the rest.
  autoVerify?: boolean;
};

const PROVIDERS: Record<string, ProviderLogin> = {
  rogers:   { name: "Rogers",        loginUrl: "https://www.rogers.com/signin", autoVerify: false },
  bell:     { name: "Bell",          loginUrl: "https://www.bell.ca/Login", notes: "MyBell sign-in" },
  telus:    { name: "Telus",         loginUrl: "https://www.telus.com/my-account" },
  videotron:{ name: "Videotron",     loginUrl: "https://www.videotron.com/en/customer-centre", notes: "Mon dossier / My account" },
  freedom:  { name: "Freedom Mobile",loginUrl: "https://myaccount.freedommobile.ca" },
  koodo:    { name: "Koodo",         loginUrl: "https://www.koodomobile.com/login" },
  fido:     { name: "Fido",          loginUrl: "https://www.fido.ca/pages/#/login" },
  virgin:   { name: "Virgin Plus",   loginUrl: "https://www.virginplus.ca/en/login.html" },
  shaw:     { name: "Shaw",          loginUrl: "https://my.shaw.ca", notes: "Now Rogers-owned; some accounts use MyRogers" },
};

// Aliases → canonical key, so form values and minor variations resolve cleanly.
const ALIASES: Record<string, string> = {
  "freedom mobile": "freedom",
  "freedommobile": "freedom",
  "virgin plus": "virgin",
  "virginplus": "virgin",
  "virgin mobile": "virgin",
};

/** Look up a provider's login page. Returns null for unknown / "Other" providers. */
export function getProviderLogin(provider: string | null | undefined): ProviderLogin | null {
  if (!provider) return null;
  const key = provider.trim().toLowerCase();
  if (PROVIDERS[key]) return PROVIDERS[key];
  if (ALIASES[key]) return PROVIDERS[ALIASES[key]];
  // Loose contains-match as a last resort (e.g. "Rogers Internet").
  const hit = Object.keys(PROVIDERS).find((k) => key.includes(k));
  return hit ? PROVIDERS[hit] : null;
}

/**
 * Whether we attempt automated credential verification for this provider.
 * Unknown/"Other" providers and Rogers fall back to the manual operator flow.
 */
export function canAutoVerify(provider: string | null | undefined): boolean {
  const p = getProviderLogin(provider);
  return !!p && p.autoVerify !== false;
}
