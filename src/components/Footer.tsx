export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-white font-extrabold text-lg" style={{ fontFamily: "var(--font-montserrat)" }}>
              NotchUp{" "}
              <span className="px-1.5 py-0.5 rounded text-sm" style={{ background: "#7F56D9" }}>
                Slash
              </span>
            </span>
            <p className="text-xs mt-1">AI-powered bill negotiation for Canadians. 🇨🇦</p>
          </div>

          <div className="flex gap-6 text-xs">
            <a href="https://notchup.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              NotchUp.app
            </a>
            <a href="mailto:help@notchup.app" className="hover:text-white transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-xs">
          <p>© {new Date().getFullYear()} NotchUp Financial Inc. All rights reserved.</p>
          <p className="mt-1 text-gray-600">
            NotchUp Slash is not affiliated with Rogers, Bell, Telus, Videotron, Freedom Mobile, or Shaw.
          </p>
        </div>
      </div>
    </footer>
  );
}
