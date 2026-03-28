import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { verifyAuth } from '@/lib/auth';
import {
  getAdminLeadsD1,
  getD1Database,
  type D1Database,
  type LeadSalesStage,
  type LeadType,
} from '@/lib/d1-db';
import { siteConfig } from '@/lib/site-config';
import { getTemplateAdminLeads } from '@/lib/template-admin';

type CloudflareEnv = {
  DB?: D1Database;
};

const leadTypes = new Set<LeadType>(['contact', 'inquiry']);
const salesStages = new Set<LeadSalesStage>(['new', 'qualified', 'won', 'junk']);

async function getDB(): Promise<D1Database | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return getD1Database((env as CloudflareEnv).DB) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const leadTypeParam = searchParams.get('leadType');
    const salesStageParam = searchParams.get('salesStage');
    const limitParam = Number.parseInt(searchParams.get('limit') || '200', 10);
    const offsetParam = Number.parseInt(searchParams.get('offset') || '0', 10);

    const leadType = leadTypeParam && leadTypes.has(leadTypeParam as LeadType)
      ? (leadTypeParam as LeadType)
      : undefined;
    const salesStage = salesStageParam && salesStages.has(salesStageParam as LeadSalesStage)
      ? (salesStageParam as LeadSalesStage)
      : undefined;

    const db = await getDB();
    if (!db) {
      if (siteConfig.templateMode) {
        const mockLeads = getTemplateAdminLeads({
          leadType,
          salesStage,
          search: searchParams.get('q') || undefined,
          limit: Number.isFinite(limitParam) ? limitParam : 200,
          offset: Number.isFinite(offsetParam) ? offsetParam : 0,
        });

        return NextResponse.json(
          {
            success: true,
            data: mockLeads,
            storage: 'template-memory',
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, error: '数据库连接不可用' },
        { status: 500 }
      );
    }

    const leads = await getAdminLeadsD1(db, {
      leadType,
      salesStage,
      search: searchParams.get('q') || undefined,
      limit: Number.isFinite(limitParam) ? limitParam : 200,
      offset: Number.isFinite(offsetParam) ? offsetParam : 0,
    });

    return NextResponse.json(
      {
        success: true,
        data: leads,
        storage: 'd1',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/leads:', error);
    return NextResponse.json(
      { success: false, error: '获取线索列表失败' },
      { status: 500 }
    );
  }
}
