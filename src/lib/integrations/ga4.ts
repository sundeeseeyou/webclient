import { createSign } from "node:crypto";
import { startOfMonthWib, toDateInputValue } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const REQUEST_TIMEOUT_MS = 10_000;

type Credentials = { clientEmail: string; privateKey: string };

export type Ga4SyncResult = { configured: boolean; synced: number; failed: number };

type TokenResponse = { access_token?: string };
type ReportResponse = { rows?: { metricValues?: { value?: string }[] }[] };

function readCredentials(): Credentials | null {
  const clientEmail = process.env.GA4_CLIENT_EMAIL?.trim();
  // Private key di environment variable biasanya ditulis satu baris dengan "\n" literal.
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  return clientEmail && privateKey ? { clientEmail, privateKey } : null;
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

// JWT service account Google ditandatangani RS256 dengan node:crypto, tanpa library tambahan.
function signJwt({ clientEmail, privateKey }: Credentials, now: Date): string {
  const issuedAt = Math.floor(now.getTime() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(
    JSON.stringify({ iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: issuedAt, exp: issuedAt + 3600 }),
  );
  const signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(privateKey);
  return `${header}.${claims}.${base64Url(signature)}`;
}

async function postJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`GA4 request gagal (${response.status}): ${await response.text()}`);
  return (await response.json()) as T;
}

async function getAccessToken(credentials: Credentials, now: Date): Promise<string> {
  const token = await postJson<TokenResponse>(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signJwt(credentials, now),
    }),
  });
  if (!token.access_token) throw new Error("GA4 tidak mengembalikan access token.");
  return token.access_token;
}

async function fetchMonthToDate(accessToken: string, propertyId: string, monthStart: Date) {
  const report = await postJson<ReportResponse>(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: toDateInputValue(monthStart), endDate: "today" }],
        metrics: [{ name: "totalUsers" }, { name: "screenPageViews" }],
      }),
    },
  );
  // Tanpa kunjungan sama sekali, GA4 tidak mengirim baris data; artinya nol.
  const values = report.rows?.[0]?.metricValues ?? [];
  return { visitors: Number(values[0]?.value ?? 0), pageviews: Number(values[1]?.value ?? 0) };
}

// GA4 bersifat opsional (PRD 6.5): tanpa kredensial langsung selesai tanpa request dan tanpa error.
export async function syncGa4Stats(now: Date = new Date()): Promise<Ga4SyncResult> {
  const credentials = readCredentials();
  if (!credentials) return { configured: false, synced: 0, failed: 0 };

  const websites = await prisma.website.findMany({
    where: { ga4PropertyId: { not: null } },
    select: { id: true, ga4PropertyId: true },
  });
  if (websites.length === 0) return { configured: true, synced: 0, failed: 0 };

  let accessToken: string;
  try {
    accessToken = await getAccessToken(credentials, now);
  } catch (error) {
    console.error("Gagal masuk ke Google Analytics.", error);
    return { configured: true, synced: 0, failed: websites.length };
  }

  const period = startOfMonthWib(now);
  let synced = 0;
  for (const website of websites) {
    if (!website.ga4PropertyId) continue;
    try {
      const { visitors, pageviews } = await fetchMonthToDate(accessToken, website.ga4PropertyId, period);
      await prisma.websiteStat.upsert({
        where: { websiteId_period: { websiteId: website.id, period } },
        create: { websiteId: website.id, period, visitors, pageviews, source: "GA4" },
        update: { visitors, pageviews, source: "GA4" },
      });
      synced += 1;
    } catch (error) {
      console.error(`Gagal sinkron GA4 untuk website ${website.id}.`, error);
    }
  }
  return { configured: true, synced, failed: websites.length - synced };
}
