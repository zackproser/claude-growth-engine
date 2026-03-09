/**
 * Lightweight Google Sheets append via Sheets API v4.
 * Uses GOOGLE_ACCESS_TOKEN (OAuth) for auth.
 * Falls back gracefully if not configured — events still stored in-memory.
 */

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN;

export function isSheetsConfigured(): boolean {
  return Boolean(SHEET_ID && ACCESS_TOKEN);
}

export async function appendToSheet(
  tab: string,
  values: string[][]
): Promise<boolean> {
  if (!SHEET_ID || !ACCESS_TOKEN) return false;

  try {
    const range = encodeURIComponent(`${tab}!A:Z`);
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );

    if (!res.ok) {
      console.error('[Sheets] Append failed:', res.status, await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Sheets] Error:', err);
    return false;
  }
}

/**
 * Log a tracking event to the "Activity" tab.
 * Columns: Timestamp | Result ID | Company URL | Event Type | Details
 */
export async function logTrackingEvent(
  resultId: string,
  companyUrl: string,
  eventType: string,
  metadata?: Record<string, string>
): Promise<boolean> {
  const details = metadata
    ? Object.entries(metadata).map(([k, v]) => `${k}: ${v}`).join(', ')
    : '';

  return appendToSheet('Activity', [
    [new Date().toISOString(), resultId, companyUrl, eventType, details],
  ]);
}

/**
 * Log a new lead to the "Leads" tab.
 * Columns: Timestamp | Company | URL | Industry | Pain Points | Score | Artifacts | Demo URL
 */
export async function logNewLead(
  company: { name: string; url: string; industry?: string; painPoints: string[] },
  demoPageUrl: string,
  artifactCount: number
): Promise<boolean> {
  return appendToSheet('Leads', [
    [
      new Date().toISOString(),
      company.name,
      company.url,
      company.industry || '',
      company.painPoints.join(', '),
      '50', // baseline score
      String(artifactCount),
      demoPageUrl,
    ],
  ]);
}
