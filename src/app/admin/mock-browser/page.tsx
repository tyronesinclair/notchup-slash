import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Placeholder shown inside the operator console's Live View iframe when Browserbase
// keys aren't configured yet, so the full activation flow is clickable pre-keys.
export default function MockBrowserPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-center px-6">
      <div className="text-5xl mb-4">🖥️</div>
      <h1 className="text-lg font-bold text-white mb-2">Live View placeholder</h1>
      <p className="text-sm text-gray-400 max-w-sm">
        This is where the customer&apos;s remote browser appears. Add
        <code className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-violet-300">BROWSERBASE_API_KEY</code>
        and
        <code className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-violet-300">BROWSERBASE_PROJECT_ID</code>
        in Railway to drive a real telco login here.
      </p>
    </div>
  );
}
