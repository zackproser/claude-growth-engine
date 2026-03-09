'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { LeadScore, TrackingEvent } from '@/lib/types';

const TEMP_CONFIG = {
  hot: { emoji: '🔥', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', label: 'Hot' },
  warm: { emoji: '🟡', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', label: 'Warm' },
  cold: { emoji: '❄️', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', label: 'Cold' },
};

function exportLeadsCSV(scores: LeadScore[]) {
  const headers = ['Company', 'URL', 'Score', 'Temperature', 'Signals', 'Next Action', 'Next Action Date', 'Last Engagement'];
  const rows = scores.map(s => [
    s.companyName, s.companyUrl, String(s.score), s.temperature,
    s.signals.join('; '), s.nextAction, s.nextActionDate, s.lastEngagement,
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `growth-engine-leads-${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

function exportActivityCSV(events: TrackingEvent[]) {
  const headers = ['Timestamp', 'Event Type', 'Company URL', 'Result ID', 'Details'];
  const rows = events.map(e => [
    e.timestamp, e.eventType, e.companyUrl || '', e.resultId,
    e.metadata ? Object.entries(e.metadata).map(([k, v]) => `${k}: ${v}`).join('; ') : '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `growth-engine-activity-${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-red-500' : score >= 40 ? 'bg-yellow-500' : 'bg-blue-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-anthropic-border rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-mono font-bold text-text-dark w-8 text-right">{score}</span>
    </div>
  );
}

function TimeAgo({ timestamp }: { timestamp: string }) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return <span>just now</span>;
  if (mins < 60) return <span>{mins}m ago</span>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <span>{hrs}h ago</span>;
  return <span>{Math.floor(hrs / 24)}d ago</span>;
}

export default function TrackingPage() {
  const [scores, setScores] = useState<LeadScore[]>([]);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'activity'>('leads');

  const fetchData = async () => {
    try {
      const [scoresRes, eventsRes] = await Promise.all([
        fetch('/api/scores'),
        fetch('/api/track'),
      ]);
      const scoresData = await scoresRes.json();
      const eventsData = await eventsRes.json();
      setScores(scoresData.scores || []);
      setEvents((eventsData.events || []).reverse());
    } catch (err) {
      console.error('Failed to fetch tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-dark">Lead Tracking</h1>
            <p className="text-text-muted text-sm mt-1">
              Real-time engagement signals → prioritized follow-ups
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => activeTab === 'leads' ? exportLeadsCSV(scores) : exportActivityCSV(events)}
              className="text-xs bg-white border border-anthropic-border hover:border-text-muted text-text-dark px-3 py-1.5 rounded-md transition-colors shadow-sm"
            >
              📥 Export CSV
            </button>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live — refreshes every 10s
            </div>
            <Link href="/" className="text-sm text-text-muted hover:text-text-dark transition-colors">
              ← Home
            </Link>
          </div>
        </div>

        {/* Spreadsheet banner */}
        <div className="bg-white border border-anthropic-border rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-sm font-semibold text-text-dark">Backed by Google Sheets via MCP</p>
              <p className="text-xs text-text-muted">All activity synced in real-time. Export anytime or open directly in Sheets.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => activeTab === 'leads' ? exportLeadsCSV(scores) : exportActivityCSV(events)}
              className="text-xs bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors font-medium"
            >
              📥 Download .csv
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-anthropic-border p-5 shadow-sm">
            <p className="text-3xl font-bold text-text-dark">{scores.length}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Total Leads</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-5 shadow-sm">
            <p className="text-3xl font-bold text-red-600">{scores.filter(s => s.temperature === 'hot').length}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider mt-1">🔥 Hot Leads</p>
          </div>
          <div className="bg-white rounded-xl border border-anthropic-border p-5 shadow-sm">
            <p className="text-3xl font-bold text-text-dark">{events.length}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Total Events</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-anthropic-border w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'leads' ? 'bg-text-dark text-white' : 'text-text-muted hover:text-text-dark'
            }`}
          >
            🎯 Lead Scores
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'activity' ? 'bg-text-dark text-white' : 'text-text-muted hover:text-text-dark'
            }`}
          >
            📊 Activity Feed
          </button>
        </div>

        {/* Leads tab */}
        {activeTab === 'leads' && (
          <div className="space-y-3">
            {scores.length === 0 ? (
              <div className="bg-white rounded-xl border border-anthropic-border p-12 text-center shadow-sm">
                <p className="text-4xl mb-4">📊</p>
                <p className="text-text-dark font-semibold mb-2">No leads yet</p>
                <p className="text-text-muted text-sm mb-4">Generate outreach and share demo pages to start tracking engagement</p>
                <Link href="/upload" className="text-primary hover:underline text-sm">
                  Get started →
                </Link>
              </div>
            ) : (
              scores.map((lead, i) => {
                const config = TEMP_CONFIG[lead.temperature];
                return (
                  <div key={i} className={`${config.bg} rounded-xl border ${config.border} p-5 transition-all hover:shadow-sm`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.emoji}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-text-dark">{lead.companyName}</h3>
                          <p className="text-xs text-text-muted">
                            Last active: <TimeAgo timestamp={lead.lastEngagement} />
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${config.bg} ${config.text} border ${config.border}`}>
                        {config.label}
                      </span>
                    </div>

                    <ScoreBar score={lead.score} />

                    {/* Signals */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {lead.signals.map((signal, j) => (
                        <span key={j} className="text-xs bg-white text-text-muted px-2.5 py-1 rounded-full border border-anthropic-border">
                          {signal}
                        </span>
                      ))}
                    </div>

                    {/* Next action */}
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-text-dark">
                        <span className="text-text-muted">Next:</span> {lead.nextAction}
                      </p>
                      <span className="text-xs text-text-muted">{lead.nextActionDate}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Activity tab */}
        {activeTab === 'activity' && (
          <div className="space-y-1">
            {events.length === 0 ? (
              <div className="bg-white rounded-xl border border-anthropic-border p-12 text-center shadow-sm">
                <p className="text-4xl mb-4">📡</p>
                <p className="text-text-dark font-semibold mb-2">No activity yet</p>
                <p className="text-text-muted text-sm">Events will appear here as prospects interact with demo pages</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-anthropic-border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-anthropic-border bg-light-alt text-text-muted text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Time</th>
                      <th className="px-4 py-3 text-left">Event</th>
                      <th className="px-4 py-3 text-left">Company</th>
                      <th className="px-4 py-3 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 50).map((event, i) => (
                      <tr key={i} className="border-b border-anthropic-border/50 hover:bg-cream transition-colors">
                        <td className="px-4 py-2.5 text-text-muted text-xs whitespace-nowrap">
                          <TimeAgo timestamp={event.timestamp} />
                        </td>
                        <td className="px-4 py-2.5">
                          <EventBadge type={event.eventType} />
                        </td>
                        <td className="px-4 py-2.5 text-text-dark text-xs truncate max-w-[200px]">
                          {event.companyUrl ? event.companyUrl.replace(/^https?:\/\//, '') : event.resultId.slice(0, 8)}
                        </td>
                        <td className="px-4 py-2.5 text-text-muted text-xs truncate max-w-[250px]">
                          {event.metadata ? Object.entries(event.metadata).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; color: string }> = {
    demo_viewed: { label: '👁 Demo View', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
    time_on_page: { label: '⏱ Time on Page', color: 'bg-purple-50 text-purple-700 border border-purple-200' },
    api_playground: { label: '🔧 API Playground', color: 'bg-green-50 text-green-700 border border-green-200' },
    lang_selected: { label: '💻 Snippet Copy', color: 'bg-orange-50 text-orange-700 border border-orange-200' },
    feedback_submitted: { label: '💬 Feedback', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    email_sent: { label: '📧 Email Sent', color: 'bg-primary/10 text-primary border border-primary/20' },
    email_opened: { label: '📬 Email Opened', color: 'bg-green-50 text-green-700 border border-green-200' },
    link_clicked: { label: '🔗 Link Click', color: 'bg-gray-50 text-gray-600 border border-gray-200' },
    page_view: { label: '📄 Page View', color: 'bg-gray-50 text-gray-600 border border-gray-200' },
  };

  const c = config[type] || { label: type, color: 'bg-neutral-500/20 text-neutral-400' };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-md ${c.color}`}>
      {c.label}
    </span>
  );
}
