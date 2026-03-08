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
            <div className="bg-dark-alt/50 border border-neutral-800 rounded-xl p-5 overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📊</span>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Your Growth Sheet</h3>
                <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full ml-auto">● Live</span>
              </div>
              {/* Mock spreadsheet */}
              <div className="bg-dark rounded-lg overflow-hidden border border-neutral-800 text-[11px] font-mono">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_60px_60px_80px_70px] bg-neutral-800/50 text-neutral-500 px-3 py-1.5 border-b border-neutral-700">
                  <span>Company</span>
                  <span>Score</span>
                  <span>Temp</span>
                  <span>Last Active</span>
                  <span>Next Action</span>
                </div>
                {[
                  { co: 'WorkOS', score: '92', temp: '🔥', tempColor: 'text-red-400', active: '2m ago', action: 'Call today' },
                  { co: 'Linear', score: '67', temp: '🟡', tempColor: 'text-yellow-400', active: '1d ago', action: 'Send case study' },
                  { co: 'Vercel', score: '45', temp: '🟡', tempColor: 'text-yellow-400', active: '3d ago', action: 'Re-engage Fri' },
                  { co: 'Supabase', score: '23', temp: '❄️', tempColor: 'text-blue-400', active: '1w ago', action: 'New content' },
                  { co: 'Clerk', score: '81', temp: '🔥', tempColor: 'text-red-400', active: '5m ago', action: 'Follow up now' },
                ].map((row) => (
                  <div key={row.co} className="grid grid-cols-[1fr_60px_60px_80px_70px] text-neutral-400 px-3 py-1.5 border-b border-neutral-800/50 hover:bg-neutral-800/30">
                    <span className="text-text-light">{row.co}</span>
                    <span>{row.score}</span>
                    <span className={row.tempColor}>{row.temp}</span>
                    <span className="text-neutral-500">{row.active}</span>
                    <span className="text-primary">{row.action}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <p className="text-[10px] text-neutral-600">Auto-synced via Google Sheets MCP — no database needed</p>
                <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  tracking 5 leads
                </div>
              </div>
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

        {/* Hottest Prospects Blade */}
        <div className="py-16 border-t border-neutral-800">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Intelligent Lead Ranking</span>
              <h2 className="text-3xl font-bold text-text-light mt-2 mb-4">Your hottest prospects, ranked by what they actually did</h2>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Every demo page view, endpoint click, language selection, and chat message feeds into a live lead score. 
                Your sheet reranks automatically — hottest prospects float to the top with a specific next action.
              </p>
              <div className="space-y-3">
                {[
                  { signal: 'Viewed demo page 3 times', points: '+15', color: 'text-green-400' },
                  { signal: 'Clicked Python tab on /payments endpoint', points: '+10', color: 'text-green-400' },
                  { signal: 'Asked question in chat widget', points: '+25', color: 'text-green-400' },
                  { signal: 'Spent 4 minutes reading value prop', points: '+20', color: 'text-green-400' },
                  { signal: 'Submitted feedback about billing needs', points: '+30', color: 'text-green-400' },
                ].map((item) => (
                  <div key={item.signal} className="flex items-center justify-between bg-dark-alt/50 rounded-lg px-4 py-2.5 border border-neutral-800">
                    <span className="text-neutral-300 text-sm">{item.signal}</span>
                    <span className={`font-mono text-sm font-bold ${item.color}`}>{item.points}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-dark-alt/50 border border-neutral-800 rounded-xl p-5 overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <span className="text-sm font-semibold text-primary">Top Prospects — Live</span>
                <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full ml-auto">● Reranking</span>
              </div>
              <div className="space-y-2">
                {[
                  { rank: 1, co: 'WorkOS', score: 92, signals: ['3 demo views', 'Python + Go tabs', 'Chat: "pricing for teams?"'], temp: '🔥', action: 'Schedule call — high intent' },
                  { rank: 2, co: 'Clerk', score: 81, signals: ['2 demo views', 'Node.js tab', 'Feedback: auth integration'], temp: '🔥', action: 'Send case study + pricing' },
                  { rank: 3, co: 'Linear', score: 67, signals: ['1 demo view', 'cURL tab', '4 min on page'], temp: '🟡', action: 'Follow up with webhook demo' },
                ].map((prospect) => (
                  <div key={prospect.co} className="bg-dark rounded-lg p-3 border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500 font-mono w-4">#{prospect.rank}</span>
                        <span className="text-text-light font-semibold text-sm">{prospect.co}</span>
                        <span>{prospect.temp}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${prospect.score}%` }} />
                        </div>
                        <span className="text-xs font-mono text-primary">{prospect.score}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {prospect.signals.map((s) => (
                        <span key={s} className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                    <p className="text-xs text-primary font-medium">→ {prospect.action}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-neutral-600 mt-3 text-center">Scores update in real-time as prospects interact with demo pages</p>
            </div>
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
