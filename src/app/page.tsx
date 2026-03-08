import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="bg-dark min-h-screen relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
            <Image src="/claude-logo.svg" alt="" width={16} height={16} />
            <span className="text-sm text-primary font-medium">Built on Claude Agent SDK</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-light mb-6 leading-[1.1] tracking-tight">
            Close prospects faster<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">with an AI growth engine</span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Paste your OpenAPI spec. Pick a target company. Claude researches them, generates personalized outreach, and scores your leads — in under 3 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/upload"
              className="bg-primary hover:bg-primary/90 text-dark px-8 py-3.5 rounded-lg text-lg font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              Get started — it&apos;s free
            </Link>
            <a
              href="https://github.com/zackproser/claude-growth-engine"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-text-light px-6 py-3.5 rounded-lg text-lg font-medium transition-colors border border-neutral-700 hover:border-neutral-600"
            >
              View on GitHub →
            </a>
          </div>
        </div>

        {/* How it works — compact pipeline */}
        <div className="py-16 border-t border-neutral-800">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-text-light mb-2">Three minutes. Four artifacts. Zero busywork.</h2>
            <p className="text-neutral-500">Every action flows through the Anthropic API via Claude Agent SDK.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-1">
            {[
              { step: '01', icon: '📄', title: 'Upload spec', desc: 'Paste your OpenAPI spec — validated with swagger-parser' },
              { step: '02', icon: '🎯', title: 'Pick target', desc: 'Enter any company URL. Claude researches them automatically.' },
              { step: '03', icon: '⚡', title: 'Agent works', desc: 'WebSearch + WebFetch find their pain points, logo, tech stack.' },
              { step: '04', icon: '🚀', title: 'Growth suite', desc: 'Cold email, demo page, value prop, LinkedIn — ready to use.' },
            ].map((item) => (
              <div key={item.step} className="bg-dark-alt/50 border border-neutral-800 p-6 first:rounded-l-xl last:rounded-r-xl">
                <div className="text-xs text-primary font-mono mb-3">{item.step}</div>
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="text-sm font-semibold text-text-light mb-1">{item.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What you get */}
        <div className="py-16 border-t border-neutral-800">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold text-text-light mb-4">Outreach that actually converts</h2>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Each target company gets a personalized outreach suite — not templates. Claude reads their site, identifies their pain points, and maps your API endpoints to their specific problems.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: '📧', text: 'Cold email under 4 lines — personalized to their pain points' },
                  { icon: '🎯', text: 'Branded demo page with their logo and "try your first API call"' },
                  { icon: '📊', text: 'Value prop mapping your endpoints to their problems' },
                  { icon: '💼', text: 'LinkedIn message referencing something real about them' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 text-neutral-300 text-sm">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-dark-alt/50 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">Lead Scoring</h3>
              <p className="text-neutral-400 text-sm mb-4">
                Track engagement on demo pages. Hottest leads float to the top of your sheet.
              </p>
              <div className="space-y-2">
                {[
                  { temp: '🔥', label: 'Hot', desc: '4 min on demo, tried 3 endpoints', color: 'text-red-400' },
                  { temp: '🟡', label: 'Warm', desc: 'Opened demo page, read value prop', color: 'text-yellow-400' },
                  { temp: '❄️', label: 'Cold', desc: 'Clicked email link, bounced', color: 'text-blue-400' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 bg-dark rounded-lg px-4 py-2.5">
                    <span className="text-lg">{item.temp}</span>
                    <span className={`text-sm font-semibold w-12 ${item.color}`}>{item.label}</span>
                    <span className="text-xs text-neutral-500">{item.desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-600 mt-3">Tracked via Google Sheets MCP — no database needed.</p>
            </div>
          </div>
        </div>

        {/* Tech stack bar */}
        <div className="py-12 border-t border-neutral-800 text-center">
          <div className="flex flex-wrap justify-center gap-6 items-center opacity-60">
            {['Claude Agent SDK', 'MCP', 'Next.js', 'swagger-parser', 'Google Sheets', 'Resend'].map((tech) => (
              <span key={tech} className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{tech}</span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 text-center border-t border-neutral-800">
          <h2 className="text-3xl font-bold text-text-light mb-3">Ready to close faster?</h2>
          <p className="text-neutral-400 mb-8">Paste your OpenAPI spec and see it work.</p>
          <Link
            href="/upload"
            className="bg-primary hover:bg-primary/90 text-dark px-8 py-3.5 rounded-lg text-lg font-semibold transition-all shadow-lg shadow-primary/20"
          >
            Upload your spec →
          </Link>
        </div>
      </div>
    </div>
  );
}
