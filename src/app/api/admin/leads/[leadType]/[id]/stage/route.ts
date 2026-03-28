import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { verifyAuth } from '@/lib/auth';
import {
  getAdminLeadByIdD1,
  getD1Database,
  updateLeadSalesStageD1,
  type D1Database,
  type LeadSalesStage,
  type LeadType,
} from '@/lib/d1-db';
import { siteConfig } from '@/lib/site-config';
import {
  getTemplateAdminLeadById,
  updateTemplateLeadSalesStage,
} from '@/lib/template-admin';

type CloudflareEnv = {
  DB?: D1Database;
};

type RouteContext = {
  params: Promise<{ leadType: string; id: string }>;
};

const stageSchema = z.object({
  salesStage: z.enum(['new', 'qualified', 'won', 'junk']),
});

const allowedTransitions: Record<LeadSalesStage, LeadSalesStage[]> = {
  new: ['qualified', 'junk'],
  qualified: ['won', 'junk'],
  won: [],
  junk: ['qualified'],
};

async function getDB(): Promise<D1Database | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return getD1Database((env as CloudflareEnv).DB) ?? undefined;
  } catch {
    return undefined;
  }
}

function normalizeLeadType(value: string): LeadType | null {
  if (value === 'contact' || value === 'inquiry') {
    return value;
  }

  return null;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await verifyAuth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const db = await getDB();
    if (!db) {
      if (siteConfig.templateMode) {
        const { leadType: rawLeadType, id: rawId } = await context.params;
        const leadType = normalizeLeadType(rawLeadType);
        const id = Number.parseInt(rawId, 10);

        if (!leadType || !Number.isFinite(id) || id < 1) {
          return NextResponse.json(
            { success: false, error: '无效的线索标识' },
            { status: 400 }
          );
        }

        const body = await request.json();
        const parsed = stageSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            {
              success: false,
              error: parsed.error.errors.map((item) => `${item.path.join('.')}: ${item.message}`).join('; '),
            },
            { status: 400 }
          );
        }

        const existingLead = getTemplateAdminLeadById(leadType, id);
        if (!existingLead) {
          return NextResponse.json(
            { success: false, error: '线索不存在' },
            { status: 404 }
          );
        }

        const nextStage = parsed.data.salesStage;
        if (existingLead.salesStage === nextStage) {
          return NextResponse.json(
            { success: true, data: existingLead, storage: 'template-memory' },
            { status: 200 }
          );
        }

        if (!allowedTransitions[existingLead.salesStage].includes(nextStage)) {
          return NextResponse.json(
            {
              success: false,
              error: `不允许从 ${existingLead.salesStage} 变更为 ${nextStage}`,
            },
            { status: 409 }
          );
        }

        const updatedLead = updateTemplateLeadSalesStage(leadType, id, nextStage);
        return NextResponse.json(
          {
            success: true,
            data: updatedLead,
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

    const { leadType: rawLeadType, id: rawId } = await context.params;
    const leadType = normalizeLeadType(rawLeadType);
    const id = Number.parseInt(rawId, 10);

    if (!leadType || !Number.isFinite(id) || id < 1) {
      return NextResponse.json(
        { success: false, error: '无效的线索标识' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = stageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors.map((item) => `${item.path.join('.')}: ${item.message}`).join('; '),
        },
        { status: 400 }
      );
    }

    const existingLead = await getAdminLeadByIdD1(db, leadType, id);
    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: '线索不存在' },
        { status: 404 }
      );
    }

    const nextStage = parsed.data.salesStage;
    if (existingLead.salesStage === nextStage) {
      return NextResponse.json(
        { success: true, data: existingLead },
        { status: 200 }
      );
    }

    if (!allowedTransitions[existingLead.salesStage].includes(nextStage)) {
      return NextResponse.json(
        {
          success: false,
          error: `不允许从 ${existingLead.salesStage} 变更为 ${nextStage}`,
        },
        { status: 409 }
      );
    }

    const updatedLead = await updateLeadSalesStageD1(db, leadType, id, nextStage);

    return NextResponse.json(
      {
        success: true,
        data: updatedLead,
        storage: 'd1',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/leads/[leadType]/[id]/stage:', error);
    return NextResponse.json(
      { success: false, error: '更新线索状态失败' },
      { status: 500 }
    );
  }
}
