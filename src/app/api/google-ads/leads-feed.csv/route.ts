import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  getAdminLeadsD1,
  getD1Database,
  type D1Database,
} from '@/lib/d1-db';
import { siteConfig } from '@/lib/site-config';

type CloudflareEnv = {
  DB?: D1Database;
};

function normalizePhoneNumber(phone: string | null): string {
  if (!phone) {
    return '';
  }

  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^\d]/g, '');
  if (!hasPlus || digits.length < 11 || digits.length > 15) {
    return '';
  }

  return `+${digits}`;
}

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function buildCsv(rows: Array<Record<string, string>>): string {
  const headers = [
    'conversion_action',
    'conversion_date_time',
    'order_id',
    'gclid',
    'gbraid',
    'wbraid',
    'email_address',
    'phone_number',
    'lead_type',
    'lead_id',
    'sales_stage',
    'source_label',
  ];

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvField(row[header] || '')).join(',')),
  ];

  return lines.join('\n');
}

function isAuthorized(request: NextRequest): boolean {
  const username = siteConfig.localPreviewMode
    ? siteConfig.googleAdsFeedUsername
    : process.env.GOOGLE_ADS_FEED_USERNAME;
  const password = siteConfig.localPreviewMode
    ? siteConfig.googleAdsFeedPassword
    : process.env.GOOGLE_ADS_FEED_PASSWORD;

  if (!username || !password) {
    return false;
  }

  const header = request.headers.get('authorization');
  if (!header?.startsWith('Basic ')) {
    return false;
  }

  try {
    const decoded = atob(header.slice('Basic '.length));
    const [providedUsername, providedPassword] = decoded.split(':');
    return providedUsername === username && providedPassword === password;
  } catch {
    return false;
  }
}

async function getDB(): Promise<D1Database | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return getD1Database((env as CloudflareEnv).DB) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Google Ads Feed"',
      },
    });
  }

  try {
    const db = await getDB();
    if (!db) {
      return NextResponse.json(
        { success: false, error: '数据库连接不可用' },
        { status: 500 }
      );
    }

    const leads = await getAdminLeadsD1(db, {
      limit: 1000,
    });

    const rows = leads
      .filter((lead) => lead.salesStage === 'qualified' || lead.salesStage === 'won')
      .map((lead) => ({
        conversion_action: lead.salesStage === 'won' ? 'Closed Deal' : 'Qualified Lead',
        conversion_date_time: lead.salesStageUpdatedAt || lead.createdAt,
        order_id: `${lead.leadType}-${lead.id}-${lead.salesStage}`,
        gclid: lead.clickIds.gclid || '',
        gbraid: lead.clickIds.gbraid || '',
        wbraid: lead.clickIds.wbraid || '',
        email_address: lead.email || '',
        phone_number: normalizePhoneNumber(lead.phone),
        lead_type: lead.leadType,
        lead_id: String(lead.id),
        sales_stage: lead.salesStage,
        source_label: lead.sourceLabel || '',
      }));

    return new NextResponse(buildCsv(rows), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/google-ads/leads-feed.csv:', error);
    return NextResponse.json(
      { success: false, error: '生成 Google Ads feed 失败' },
      { status: 500 }
    );
  }
}
