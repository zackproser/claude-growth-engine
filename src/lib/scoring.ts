import type { TrackingEvent, LeadScore } from './types';

/** Signal weights for lead scoring */
const WEIGHTS: Record<string, number> = {
  demo_viewed: 10,
  time_on_page: 15,
  api_playground: 20,
  lang_selected: 25,     // copied a snippet — high intent
  feedback_submitted: 30,
  link_clicked: 10,
  email_sent: 5,
  email_opened: 15,
  page_view: 5,
};

/** Extra weight for repeated engagement */
const REPEAT_BONUS = 5;

function getTemperature(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 80) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

function getNextAction(temp: 'hot' | 'warm' | 'cold', signals: string[]): { action: string; daysOut: number } {
  if (temp === 'hot') return { action: 'Follow up today — schedule a call', daysOut: 0 };
  if (temp === 'warm') return { action: 'Send case study or technical deep-dive', daysOut: 2 };
  return { action: 'Re-engage with new content or demo update', daysOut: 7 };
}

/**
 * Compute lead scores from raw tracking events.
 * Groups by companyUrl (or resultId as fallback), aggregates signals.
 */
export function computeLeadScores(events: TrackingEvent[]): LeadScore[] {
  // Group events by company
  const byCompany = new Map<string, TrackingEvent[]>();

  for (const event of events) {
    const key = event.companyUrl || event.resultId;
    if (!byCompany.has(key)) byCompany.set(key, []);
    byCompany.get(key)!.push(event);
  }

  const scores: LeadScore[] = [];

  for (const [key, companyEvents] of byCompany) {
    let score = 0;
    const signals: string[] = [];
    const eventTypeCounts = new Map<string, number>();

    // Sort by timestamp
    companyEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (const event of companyEvents) {
      const eventType = event.eventType as string;
      const count = (eventTypeCounts.get(eventType) || 0) + 1;
      eventTypeCounts.set(eventType, count);

      // Base weight
      const weight = WEIGHTS[eventType] || 5;
      score += weight;

      // Repeat engagement bonus
      if (count > 1) {
        score += REPEAT_BONUS;
      }

      // Language preference signal
      if (eventType === 'lang_selected' && event.metadata?.language) {
        const lang = event.metadata.language;
        if (!signals.includes(`Uses ${lang}`)) {
          signals.push(`Uses ${lang}`);
        }
      }

      // Chat/feedback content
      if (eventType === 'feedback_submitted' && event.metadata?.chat_message) {
        signals.push(`Asked: "${event.metadata.chat_message.slice(0, 50)}"`);
      } else if (eventType === 'feedback_submitted' && event.metadata?.feedback) {
        signals.push(`Feedback: "${event.metadata.feedback.slice(0, 50)}"`);
      }
    }

    // Build signal summary
    for (const [type, count] of eventTypeCounts) {
      if (type === 'demo_viewed') signals.unshift(`${count} demo view${count > 1 ? 's' : ''}`);
      else if (type === 'api_playground') signals.push(`${count} API interaction${count > 1 ? 's' : ''}`);
      else if (type === 'time_on_page') signals.push('Spent 2+ min on page');
    }

    // Cap at 100
    score = Math.min(score, 100);

    const temperature = getTemperature(score);
    const { action, daysOut } = getNextAction(temperature, signals);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysOut);

    const lastEvent = companyEvents[companyEvents.length - 1];

    scores.push({
      companyName: key.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      companyUrl: key,
      score,
      temperature,
      signals,
      nextAction: action,
      nextActionDate: nextDate.toISOString().split('T')[0],
      lastEngagement: lastEvent.timestamp,
    });
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  return scores;
}
