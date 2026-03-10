const signals = [
  { signal: 'Viewed demo page 3 times', points: '+15' },
  { signal: 'Clicked Python tab on /payments endpoint', points: '+10' },
  { signal: 'Asked question in chat widget', points: '+25' },
  { signal: 'Spent 4 minutes reading value prop', points: '+20' },
  { signal: 'Submitted feedback about billing needs', points: '+30' },
];

const prospects = [
  { rank: 1, co: 'WorkOS', score: 92, signals: ['3 demo views', 'Python + Go tabs', 'Chat: pricing for teams?'], temp: '🔥', action: 'Schedule call — high intent' },
  { rank: 2, co: 'Clerk', score: 81, signals: ['2 demo views', 'Node.js tab', 'Feedback: auth integration'], temp: '🔥', action: 'Send case study + pricing' },
  { rank: 3, co: 'Linear', score: 67, signals: ['1 demo view', 'cURL tab', '4 min on page'], temp: '🟡', action: 'Follow up with webhook demo' },
];

export default function HottestProspects() {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Intelligent Lead Ranking</span>
        <h2 className="text-3xl font-bold text-text-dark mt-3 mb-5">Your hottest prospects, ranked by what they actually did</h2>
        <p className="text-text-muted mb-6 leading-relaxed">
          Every demo page view, endpoint click, language selection, and chat message feeds into a live lead score.
          Your sheet reranks automatically — hottest prospects float to the top with a specific next action.
        </p>
        <div className="space-y-2.5">
          {signals.map((item) => (
            <div key={item.signal} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-anthropic-border">
              <span className="text-text-dark text-sm">{item.signal}</span>
              <span className="font-mono text-sm font-bold text-green-600">{item.points}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-anthropic-border rounded-xl p-5 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎯</span>
          <span className="text-sm font-semibold text-text-dark">Top Prospects — Live</span>
          <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full ml-auto">● Reranking</span>
        </div>
        <div className="space-y-2">
          {prospects.map((prospect) => (
            <div key={prospect.co} className="bg-cream rounded-lg p-3 border border-anthropic-border hover:shadow-sm transition-all">
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
                  <span key={s} className="text-[10px] bg-light-alt text-text-muted px-2 py-0.5 rounded-full border border-anthropic-border">{s}</span>
                ))}
              </div>
              <p className="text-xs text-primary font-medium">&rarr; {prospect.action}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-text-muted/50 mt-3 text-center">Scores update in real-time as prospects interact with demo pages</p>
      </div>
    </div>
  );
}
