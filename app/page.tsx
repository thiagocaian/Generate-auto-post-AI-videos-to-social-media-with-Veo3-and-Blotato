import Link from "next/link";
import ChatWidget from "./components/ChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <span className="font-semibold text-lg">DataAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#how" className="hover:text-indigo-600 transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/sign-in" className="text-sm bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors">
            Try for free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-8 py-24 max-w-4xl mx-auto">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-600">
          ✨ AI-powered data analysis
        </span>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Turn your data into{" "}
          <span className="text-indigo-600">intelligent decisions</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl">
          Connect your data sources, ask questions in plain language, and get
          actionable insights in seconds. No code, no complexity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/sign-in" className="bg-indigo-600 text-white rounded-xl px-8 py-3.5 font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Get started for free
          </Link>
          <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-8 py-3.5 font-semibold hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch demo
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why choose DataAI?</h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            Everything you need to extract value from your data, in one platform.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "⚡",
                title: "Instant analysis",
                desc: "Ask questions in plain English and get answers and charts in seconds.",
              },
              {
                icon: "🔗",
                title: "Multiple sources",
                desc: "Connect databases, spreadsheets, APIs, and CSV files with ease.",
              },
              {
                icon: "🔒",
                title: "Total security",
                desc: "Your data never leaves your environment. End-to-end encryption.",
              },
              {
                icon: "📊",
                title: "Auto dashboards",
                desc: "Reports and dashboards generated automatically from your data.",
              },
              {
                icon: "🤖",
                title: "Advanced AI",
                desc: "State-of-the-art language models for deep and accurate analysis.",
              },
              {
                icon: "🧩",
                title: "No code needed",
                desc: "Intuitive interface for analysts and managers — no programming required.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-14">How it works</h2>
        <div className="flex flex-col md:flex-row gap-8 text-center">
          {[
            { step: "1", title: "Connect your data", desc: "Import CSVs, connect a database, or integrate via API." },
            { step: "2", title: "Ask your question", desc: "Type in plain English what you want to know about your data." },
            { step: "3", title: "Get insights", desc: "The AI analyzes and delivers charts, tables, and recommendations." },
          ].map((s) => (
            <div key={s.step} className="flex-1 flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                {s.step}
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="bg-indigo-600 py-20 px-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
          14-day free trial. No credit card required. Cancel anytime.
        </p>
        <Link href="/sign-in" className="bg-white text-indigo-600 font-semibold rounded-xl px-10 py-3.5 hover:bg-indigo-50 transition-colors shadow-lg inline-block">
          Create free account
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 text-center text-sm text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} DataAI. All rights reserved.
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </main>
  );
}
