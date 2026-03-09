import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="pt-28 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-anthropic-border rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <Image src="/claude-logo.svg" alt="" width={16} height={16} />
            <span className="text-sm text-text-muted font-medium">Built on Claude Agent SDK</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-dark mb-6 leading-[1.08] tracking-tight">
            Close prospects faster<br />
            <span className="text-primary">with an AI growth engine</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            Paste your OpenAPI spec. Pick a target company. Claude researches them, generates personalized outreach, and scores your leads — in under 3 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/upload"
              className="bg-text-dark hover:bg-neutral-800 text-white px-8 py-3.5 rounded-full text-lg font-semibold transition-all shadow-sm"
            >
              Get started — it&apos;s free
            </Link>
            <a
              href="https://github.com/zackproser/claude-growth-engine"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-dark px-6 py-3.5 rounded-full text-lg font-medium transition-colors border border-anthropic-border hover:border-neutral-400"
            >
              View on GitHub →
            </a>
          </div>
        </div>

        {/* One URL blade */}
        <div className="py-20 border-t border-anthropic-border">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">One input. Full intelligence.</span>
              <h2 className="text-3xl font-bold text-text-dark mt-3 mb-5 leading-tight">Give the agent a URL.<br />It does the rest.</h2>
              <p className="text-text-muted mb-6 leading-relaxed">
                You don&apos;t prep anything about the target company. The Claude agent takes a single URL and autonomously builds a complete picture — then generates outreach materials that reference specific details only someone who did the homework would know.
              </p>
              <p className="text-text-muted/70 text-sm leading-relaxed">
                Every action is a real Anthropic API call through the Claude Agent SDK. WebSearch finds their public footprint. WebFetch reads their site. The agent reasons about what it finds — no templates, no mail-merge, no shortcuts.
              </p>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: '🔍', title: 'Deep company research', desc: 'Searches the web for news, funding, product launches, competitive positioning. Reads their entire site.', tag: 'WebSearch + WebFetch' },
                { icon: '🧠', title: 'Pain point identification', desc: 'Analyzes their business model and maps challenges to your specific API capabilities.', tag: 'Claude reasoning' },
                { icon: '🛠️', title: 'Tech stack detection', desc: 'Identifies their tools, frameworks, and infrastructure from job postings, docs, and site source.', tag: 'WebFetch' },
                { icon: '🎨', title: 'Brand asset discovery', desc: 'Finds their logo, brand colors, and tagline to personalize the demo page.', tag: 'WebSearch' },
                { icon: '📊', title: 'Competitive context', desc: 'Understands where they sit in the market so your outreach references what matters to them.', tag: 'Claude reasoning' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 bg-white rounded-xl border border-anthropic-border p-4 hover:shadow-md transition-all">
                  <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-text-dark">{item.title}</h3>
                      <span className="text-[10px] bg-cream text-text-muted px-2 py-0.5 rounded-full font-mono border border-anthropic-border">{item.tag}</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works — compact pipeline */}
        <div className="py-20 border-t border-anthropic-border">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-text-dark mb-2">Three minutes. Five steps. Zero busywork.</h2>
            <p className="text-text-muted">Every action flows through the Anthropic API via Claude Agent SDK.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-px bg-anthropic-border rounded-2xl overflow-hidden">
            {[
              { step: '01', icon: '📄', title: 'Upload spec', desc: 'Paste your OpenAPI spec — validated with swagger-parser' },
              { step: '02', icon: '🎯', title: 'Pick target', desc: 'Enter any company URL. Claude researches them automatically.' },
              { step: '03', icon: '⚡', title: 'Agent works', desc: 'WebSearch + WebFetch find their pain points, logo, tech stack.' },
              { step: '04', icon: '🚀', title: 'Growth suite', desc: 'Cold email, demo page, value prop, LinkedIn — ready to use.' },
              { step: '05', icon: '📊', title: 'Track & close', desc: 'Every click, copy, and question logged to Google Sheets for follow-up.' },
            ].map((item) => (
              <div key={item.step} className="bg-white p-6">
                <div className="text-xs text-primary font-mono mb-3 font-semibold">{item.step}</div>
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="text-sm font-semibold text-text-dark mb-1">{item.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What you get */}
        <div className="py-20 border-t border-anthropic-border">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-text-dark mb-4 leading-tight">Outreach that actually converts</h2>
              <p className="text-text-muted mb-6 leading-relaxed">
                Each target company gets a personalized outreach suite — not templates. Claude reads their site, identifies their pain points, and maps your API endpoints to their specific problems.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: '📧', text: 'Cold email under 4 lines — personalized to their pain points' },
                  { icon: '🎯', text: 'Branded demo page with their logo and "try your first API call"' },
                  { icon: '📊', text: 'Value prop mapping your endpoints to their problems' },
                  { icon: '💼', text: 'LinkedIn message referencing something real about them' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 text-text-dark text-sm">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-anthropic-border rounded-2xl p-5 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📊</span>
                <h3 className="text-sm font-semibold text-text-dark uppercase tracking-wider">Your Growth Sheet</h3>
                <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full ml-auto border border-green-200">● Live</span>
              </div>
              {/* Mock spreadsheet */}
              <div className="bg-cream rounded-lg overflow-hidden border border-anthropic-border text-[11px] font-mono">
                <div className="grid grid-cols-[1fr_60px_60px_80px_70px] bg-light-alt text-text-muted px-3 py-1.5 border-b border-anthropic-border font-semibold">
                  <span>Company</span>
                  <span>Score</span>
                  <span>Temp</span>
                  <span>Last Active</span>
                  <span>Next Action</span>
                </div>
                {[
                  { co: 'WorkOS', score: '92', temp: '🔥', active: '2m ago', action: 'Call today' },
                  { co: 'Linear', score: '67', temp: '🟡', active: '1d ago', action: 'Send case study' },
                  { co: 'Vercel', score: '45', temp: '🟡', active: '3d ago', action: 'Re-engage Fri' },
                  { co: 'Supabase', score: '23', temp: '❄️', active: '1w ago', action: 'New content' },
                  { co: 'Clerk', score: '81', temp: '🔥', active: '5m ago', action: 'Follow up now' },
                ].map((row) => (
                  <div key={row.co} className="grid grid-cols-[1fr_60px_60px_80px_70px] text-text-muted px-3 py-1.5 border-b border-anthropic-border/50 hover:bg-light-alt/50">
                    <span className="text-text-dark font-medium">{row.co}</span>
                    <span>{row.score}</span>
                    <span>{row.temp}</span>
                    <span className="text-text-muted/60">{row.active}</span>
                    <span className="text-primary font-medium">{row.action}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <p className="text-[10px] text-text-muted/50">Auto-synced via Google Sheets MCP — no database needed</p>
                <div className="flex items-center gap-1 text-[10px] text-text-muted/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  tracking 5 leads
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech stack bar */}
        <div className="py-10 border-t border-anthropic-border text-center">
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {['Claude Agent SDK', 'MCP', 'Next.js', 'swagger-parser', 'Google Sheets', 'Resend'].map((tech) => (
              <span key={tech} className="text-xs font-mono text-text-muted/40 uppercase tracking-widest">{tech}</span>
            ))}
          </div>
        </div>

        {/* Hottest Prospects Blade */}
        <div className="py-20 border-t border-anthropic-border">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Intelligent Lead Ranking</span>
              <h2 className="text-3xl font-bold text-text-dark mt-3 mb-5 leading-tight">Your hottest prospects, ranked by what they actually did</h2>
              <p className="text-text-muted mb-6 leading-relaxed">
                Every demo page view, endpoint click, language selection, and chat message feeds into a live lead score.
                Your sheet reranks automatically — hottest prospects float to the top with a specific next action.
              </p>
              <div className="space-y-2">
                {[
                  { signal: 'Viewed demo page 3 times', points: '+15' },
                  { signal: 'Clicked Python tab on /payments endpoint', points: '+10' },
                  { signal: 'Asked question in chat widget', points: '+25' },
                  { signal: 'Spent 4 minutes reading value prop', points: '+20' },
                  { signal: 'Submitted feedback about billing needs', points: '+30' },
                ].map((item) => (
                  <div key={item.signal} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-anthropic-border">
                    <span className="text-text-dark text-sm">{item.signal}</span>
                    <span className="font-mono text-sm font-bold text-green-600">{item.points}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-anthropic-border rounded-2xl p-5 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <span className="text-sm font-semibold text-text-dark">Top Prospects — Live</span>
                <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full ml-auto border border-green-200">● Reranking</span>
              </div>
              <div className="space-y-2">
                {[
                  { rank: 1, co: 'WorkOS', score: 92, signals: ['3 demo views', 'Python + Go tabs', 'Chat: "pricing for teams?"'], temp: '🔥', action: 'Schedule call — high intent' },
                  { rank: 2, co: 'Clerk', score: 81, signals: ['2 demo views', 'Node.js tab', 'Feedback: auth integration'], temp: '🔥', action: 'Send case study + pricing' },
                  { rank: 3, co: 'Linear', score: 67, signals: ['1 demo view', 'cURL tab', '4 min on page'], temp: '🟡', action: 'Follow up with webhook demo' },
                ].map((prospect) => (
                  <div key={prospect.co} className="bg-cream rounded-xl p-3.5 border border-anthropic-border hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted font-mono w-4">#{prospect.rank}</span>
                        <span className="text-text-dark font-semibold text-sm">{prospect.co}</span>
                        <span>{prospect.temp}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-anthropic-border rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${prospect.score}%` }} />
                        </div>
                        <span className="text-xs font-mono text-primary font-bold">{prospect.score}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {prospect.signals.map((s) => (
                        <span key={s} className="text-[10px] bg-white text-text-muted px-2 py-0.5 rounded-full border border-anthropic-border">{s}</span>
                      ))}
                    </div>
                    <p className="text-xs text-primary font-medium">→ {prospect.action}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-text-muted/50 mt-3 text-center">Scores update in real-time as prospects interact with demo pages</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-20 text-center border-t border-anthropic-border">
          <h2 className="text-3xl font-bold text-text-dark mb-3">Ready to close faster?</h2>
          <p className="text-text-muted mb-8">Paste your OpenAPI spec and see it work.</p>
          <Link
            href="/upload"
            className="bg-text-dark hover:bg-neutral-800 text-white px-8 py-3.5 rounded-full text-lg font-semibold transition-all shadow-sm"
          >
            Upload your spec →
          </Link>
        </div>
      </div>
    </div>
  );
}
