import Link from 'next/link';
import Image from 'next/image';
import HottestProspects from '@/components/HottestProspects';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero — white background for contrast */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-28 pb-20 text-center">
            <div className="inline-flex items-center gap-2 bg-cream border border-anthropic-border rounded-full px-4 py-1.5 mb-8">
              <Image src="/claude-logo.svg" alt="" width={16} height={16} />
              <span className="text-sm text-text-dark font-medium">Built on Claude Agent SDK</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-dark mb-6 leading-[1.1] tracking-tight">
              Close prospects faster<br />
              <span className="text-primary">with an AI growth engine</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
              Paste your OpenAPI spec. Pick a target company. Claude researches them, generates personalized outreach, and scores your leads — in under 3 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/upload"
                className="bg-text-dark hover:bg-text-dark/90 text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-all shadow-sm"
              >
                Get started — it&apos;s free
              </Link>
              <a
                href="https://github.com/zackproser/claude-growth-engine"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-dark px-6 py-3.5 rounded-lg text-lg font-medium transition-colors border border-anthropic-border hover:border-text-muted"
              >
                View on GitHub →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* One URL + Pipeline — cream section */}
      <div className="bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* One URL blade */}
        <div className="py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">One input. Full intelligence.</span>
              <h2 className="text-3xl font-bold text-text-dark mt-3 mb-5">Give the agent a URL. It does the rest.</h2>
              <p className="text-text-muted mb-6 leading-relaxed">
                You don&apos;t prep anything about the target company. The Claude agent takes a single URL and autonomously builds a complete picture — then generates outreach materials that reference specific details only someone who did the homework would know.
              </p>
              <p className="text-text-muted/70 text-sm leading-relaxed">
                Every action is a real Anthropic API call through the Claude Agent SDK. WebSearch finds their public footprint. WebFetch reads their site. The agent reasons about what it finds — no templates, no mail-merge, no shortcuts.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: '🔍', title: 'Deep company research', desc: 'Searches the web for news, funding, product launches, competitive positioning. Reads their entire site.', tag: 'WebSearch + WebFetch' },
                { icon: '🧠', title: 'Pain point identification', desc: 'Analyzes their business model and maps challenges to your specific API capabilities.', tag: 'Claude reasoning' },
                { icon: '🛠️', title: 'Tech stack detection', desc: 'Identifies their tools, frameworks, and infrastructure from job postings, docs, and site source.', tag: 'WebFetch' },
                { icon: '🎨', title: 'Brand asset discovery', desc: 'Finds their logo, brand colors, and tagline to personalize the demo page.', tag: 'WebSearch' },
                { icon: '📊', title: 'Competitive context', desc: 'Understands where they sit in the market so your outreach references what matters to them.', tag: 'Claude reasoning' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 bg-white rounded-xl border border-anthropic-border p-4 hover:shadow-sm transition-all">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-text-dark">{item.title}</h3>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">{item.tag}</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works — compact pipeline */}
        <div className="py-20 border-t border-anthropic-border/50">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-text-dark mb-2">Three minutes. Five steps. Zero busywork.</h2>
            <p className="text-text-muted">Every action flows through the Anthropic API via Claude Agent SDK.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-px bg-anthropic-border rounded-xl overflow-hidden">
            {[
              { step: '01', icon: '📄', title: 'Upload spec', desc: 'Paste your OpenAPI spec — validated with swagger-parser' },
              { step: '02', icon: '🎯', title: 'Pick target', desc: 'Enter any company URL. Claude researches them automatically.' },
              { step: '03', icon: '⚡', title: 'Agent works', desc: 'WebSearch + WebFetch find their pain points, logo, tech stack.' },
              { step: '04', icon: '🚀', title: 'Growth suite', desc: 'Cold email, demo page, value prop, LinkedIn — ready to use.' },
              { step: '05', icon: '📊', title: 'Track & close', desc: 'Every click, copy, and question logged to Google Sheets for follow-up.' },
            ].map((item) => (
              <div key={item.step} className="bg-white p-6">
                <div className="text-xs text-primary font-mono mb-3">{item.step}</div>
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="text-sm font-semibold text-text-dark mb-1">{item.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      </div>

      {/* What you get — white section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-3xl font-bold text-text-dark mb-4">Outreach that actually converts</h2>
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
            <div className="bg-white border border-anthropic-border rounded-xl p-5 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📊</span>
                <h3 className="text-sm font-semibold text-text-dark uppercase tracking-wider">Your Growth Sheet</h3>
                <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full ml-auto">● Live</span>
              </div>
              {/* Mock spreadsheet */}
              <div className="bg-cream rounded-lg overflow-hidden border border-anthropic-border text-[11px] font-mono">
                <div className="grid grid-cols-[1fr_60px_60px_80px_70px] bg-light-alt text-text-muted px-3 py-1.5 border-b border-anthropic-border">
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
                    <span className="text-primary">{row.action}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <p className="text-[10px] text-text-muted/50">Synced via Google Sheets MCP — exportable, shareable, no database</p>
                <div className="flex items-center gap-1 text-[10px] text-text-muted/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  tracking 5 leads
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech stack bar */}
        <div className="py-12 border-t border-anthropic-border/50 text-center">
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {['Claude Agent SDK', 'MCP', 'Next.js', 'swagger-parser', 'Google Sheets', 'Resend'].map((tech) => (
              <span key={tech} className="text-xs font-mono text-text-muted/40 uppercase tracking-widest">{tech}</span>
            ))}
          </div>
        </div>

      </div>

      <div className="bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <HottestProspects />
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-bold text-text-dark mb-3">Ready to close faster?</h2>
          <p className="text-text-muted mb-8">Paste your OpenAPI spec and see it work.</p>
          <Link
            href="/upload"
            className="bg-text-dark hover:bg-text-dark/90 text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-all shadow-sm"
          >
            Upload your spec →
          </Link>
        </div>
      </div>
    </div>
  );
}
