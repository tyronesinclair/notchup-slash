import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-white font-extrabold text-lg" style={{ fontFamily: "var(--font-montserrat)" }}>
                NotchUp
              </span>
              <span className="px-2 py-0.5 rounded font-extrabold text-sm text-white" style={{ background: "#7F56D9", fontFamily: "var(--font-montserrat)" }}>
                Slash
              </span>
            </div>
            <p className="text-xs text-gray-500">AI-powered bill negotiation for Canadians 🇨🇦</p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs">
            <a href="https://notchup.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              NotchUp.app
            </a>
            <a href="mailto:help@notchup.app" className="hover:text-white transition-colors">
              help@notchup.app
            </a>
            <Link href="/sign-up" className="hover:text-white transition-colors">
              Get Started
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} NotchUp Financial Inc. All rights reserved.</p>
          <p className="text-gray-600 text-center sm:text-right">
            Not affiliated with Rogers, Bell, Telus, Videotron, Freedom Mobile, or Shaw.
          </p>
        </div>
      </div>
    </footer>
  );
}
