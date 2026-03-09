'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { LeadScore, TrackingEvent } from '@/lib/types';

const TEMP_CONFIG = {
  hot: { emoji: '🔥', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Hot' },
  warm: { emoji: '🟡', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Warm' },
  cold: { emoji: '❄️', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Cold' },
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-red-500' : score >= 40 ? 'bg-yellow-500' : 'bg-blue-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-mono font-bold text-text-light w-8 text-right">{score}</span>
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
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-dark min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-light">Lead Tracking</h1>
            <p className="text-neutral-400 text-sm mt-1">
              Real-time engagement signals → prioritized follow-ups
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live — refreshes every 10s
            </div>
            <Link href="/" className="text-sm text-neutral-400 hover:text-text-light transition-colors">
              ← Home
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-alt rounded-xl border border-neutral-700 p-5">
            <p className="text-3xl font-bold text-text-light">{scores.length}</p>
            <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Total Leads</p>
          </div>
          <div className="bg-dark-alt rounded-xl border border-red-500/20 p-5">
            <p className="text-3xl font-bold text-red-400">{scores.filter(s => s.temperature === 'hot').length}</p>
            <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">🔥 Hot Leads</p>
          </div>
          <div className="bg-dark-alt rounded-xl border border-neutral-700 p-5">
            <p className="text-3xl font-bold text-text-light">{events.length}</p>
            <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Total Events</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-dark-alt rounded-lg p-1 border border-neutral-700 w-fit">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'leads' ? 'bg-primary text-dark' : 'text-neutral-400 hover:text-text-light'
            }`}
          >
            🎯 Lead Scores
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'activity' ? 'bg-primary text-dark' : 'text-neutral-400 hover:text-text-light'
            }`}
          >
            📊 Activity Feed
          </button>
        </div>

        {/* Leads tab */}
        {activeTab === 'leads' && (
          <div className="space-y-3">
            {scores.length === 0 ? (
              <div className="bg-dark-alt rounded-xl border border-neutral-700 p-12 text-center">
                <p className="text-4xl mb-4">📊</p>
                <p className="text-text-light font-semibold mb-2">No leads yet</p>
                <p className="text-neutral-400 text-sm mb-4">Generate outreach and share demo pages to start tracking engagement</p>
                <Link href="/upload" className="text-primary hover:underline text-sm">
                  Get started →
                </Link>
              </div>
            ) : (
              scores.map((lead, i) => {
                const config = TEMP_CONFIG[lead.temperature];
                return (
                  <div key={i} className={`${config.bg} rounded-xl border ${config.border} p-5 transition-all hover:scale-[1.01]`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.emoji}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-text-light">{lead.companyName}</h3>
                          <p className="text-xs text-neutral-400">
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
                        <span key={j} className="text-xs bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-full">
                          {signal}
                        </span>
                      ))}
                    </div>

                    {/* Next action */}
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-neutral-300">
                        <span className="text-neutral-500">Next:</span> {lead.nextAction}
                      </p>
                      <span className="text-xs text-neutral-500">{lead.nextActionDate}</span>
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
              <div className="bg-dark-alt rounded-xl border border-neutral-700 p-12 text-center">
                <p className="text-4xl mb-4">📡</p>
                <p className="text-text-light font-semibold mb-2">No activity yet</p>
                <p className="text-neutral-400 text-sm">Events will appear here as prospects interact with demo pages</p>
              </div>
            ) : (
              <div className="bg-dark-alt rounded-xl border border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-700 text-neutral-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Time</th>
                      <th className="px-4 py-3 text-left">Event</th>
                      <th className="px-4 py-3 text-left">Company</th>
                      <th className="px-4 py-3 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 50).map((event, i) => (
                      <tr key={i} className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors">
                        <td className="px-4 py-2.5 text-neutral-500 text-xs whitespace-nowrap">
                          <TimeAgo timestamp={event.timestamp} />
                        </td>
                        <td className="px-4 py-2.5">
                          <EventBadge type={event.eventType} />
                        </td>
                        <td className="px-4 py-2.5 text-neutral-300 text-xs truncate max-w-[200px]">
                          {event.companyUrl ? event.companyUrl.replace(/^https?:\/\//, '') : event.resultId.slice(0, 8)}
                        </td>
                        <td className="px-4 py-2.5 text-neutral-500 text-xs truncate max-w-[250px]">
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
    demo_viewed: { label: '👁 Demo View', color: 'bg-blue-500/20 text-blue-400' },
    time_on_page: { label: '⏱ Time on Page', color: 'bg-purple-500/20 text-purple-400' },
    api_playground: { label: '🔧 API Playground', color: 'bg-green-500/20 text-green-400' },
    lang_selected: { label: '💻 Snippet Copy', color: 'bg-orange-500/20 text-orange-400' },
    feedback_submitted: { label: '💬 Feedback', color: 'bg-yellow-500/20 text-yellow-400' },
    email_sent: { label: '📧 Email Sent', color: 'bg-primary/20 text-primary' },
    email_opened: { label: '📬 Email Opened', color: 'bg-green-500/20 text-green-400' },
    link_clicked: { label: '🔗 Link Click', color: 'bg-neutral-500/20 text-neutral-400' },
    page_view: { label: '📄 Page View', color: 'bg-neutral-500/20 text-neutral-400' },
  };

  const c = config[type] || { label: type, color: 'bg-neutral-500/20 text-neutral-400' };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-md ${c.color}`}>
      {c.label}
    </span>
  );
}
