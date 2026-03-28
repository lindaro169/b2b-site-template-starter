'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import styles from './contacts.module.css';

type LeadType = 'contact' | 'inquiry';
type SalesStage = 'all' | 'new' | 'qualified' | 'won' | 'junk';

interface LeadGeo {
  city?: string;
  region?: string;
  countryName?: string;
}

interface LeadTrackingPage {
  path: string;
  pathWithQuery: string;
  label: string;
  enteredAt: string;
  durationMs: number;
}

interface LeadTracking {
  pages?: LeadTrackingPage[];
}

interface LeadRecord {
  id: number;
  leadType: LeadType;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  productId: number | null;
  status: string | null;
  salesStage: Exclude<SalesStage, 'all'>;
  salesStageUpdatedAt: string | null;
  createdAt: string;
  visitorType: string | null;
  landingPage: string | null;
  sourceLabel: string | null;
  sourcePlatform: string | null;
  sourceChannel: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  clickIds: Record<string, string>;
  customTags: Record<string, string>;
  tracking: LeadTracking | null;
  geo: LeadGeo | null;
}

const stageLabelMap: Record<Exclude<SalesStage, 'all'>, string> = {
  new: '待审核',
  qualified: '有效询盘',
  won: '已成交',
  junk: '垃圾/无效',
};

const typeLabelMap: Record<LeadType, string> = {
  contact: 'Contact',
  inquiry: 'Inquiry',
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
      return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function formatLocation(geo: LeadGeo | null): string {
  const parts = [geo?.city, geo?.region, geo?.countryName].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '未知';
}

function buildTagLines(lead: LeadRecord): string[] {
  const tags: string[] = [];

  if (lead.utmSource) tags.push(`utm_source=${lead.utmSource}`);
  if (lead.utmMedium) tags.push(`utm_medium=${lead.utmMedium}`);
  if (lead.utmCampaign) tags.push(`utm_campaign=${lead.utmCampaign}`);
  if (lead.utmTerm) tags.push(`utm_term=${lead.utmTerm}`);
  if (lead.utmContent) tags.push(`utm_content=${lead.utmContent}`);

  Object.entries(lead.clickIds || {}).forEach(([key, value]) => tags.push(`${key}=${value}`));
  Object.entries(lead.customTags || {}).forEach(([key, value]) => tags.push(`${key}=${value}`));

  return tags;
}

export default function ContactsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [salesStage, setSalesStage] = useState<SalesStage>('all');
  const [leadType, setLeadType] = useState<'all' | LeadType>('all');
  const [search, setSearch] = useState('');
  const [actionKey, setActionKey] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/leads?limit=200', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const result = await response.json();
      const nextLeads = (result.data || []) as LeadRecord[];
      setLeads(nextLeads);
      setSelectedLead((current) => {
        if (!nextLeads.length) {
          return null;
        }

        if (!current) {
          return nextLeads[0];
        }

        return nextLeads.find((item) => item.id === current.id && item.leadType === current.leadType) || nextLeads[0];
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && token) {
      fetchLeads();
    }
  }, [authLoading, token, fetchLeads]);

  const filteredLeads = leads.filter((lead) => {
    if (salesStage !== 'all' && lead.salesStage !== salesStage) {
      return false;
    }

    if (leadType !== 'all' && lead.leadType !== leadType) {
      return false;
    }

    if (!search.trim()) {
      return true;
    }

    const keyword = search.trim().toLowerCase();
    return [
      lead.name,
      lead.email,
      lead.company || '',
      lead.subject || '',
      lead.message,
      lead.sourceLabel || '',
      lead.utmCampaign || '',
    ].some((value) => value.toLowerCase().includes(keyword));
  });

  const stageCounts = {
    all: leads.length,
    new: leads.filter((lead) => lead.salesStage === 'new').length,
    qualified: leads.filter((lead) => lead.salesStage === 'qualified').length,
    won: leads.filter((lead) => lead.salesStage === 'won').length,
    junk: leads.filter((lead) => lead.salesStage === 'junk').length,
  };

  const handleStageChange = async (
    lead: LeadRecord,
    nextStage: Exclude<SalesStage, 'all'>
  ) => {
    const key = `${lead.leadType}-${lead.id}-${nextStage}`;
    setActionKey(key);

    try {
      const response = await fetch(`/api/admin/leads/${lead.leadType}/${lead.id}/stage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ salesStage: nextStage }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update lead stage');
      }

      const updatedLead = result.data as LeadRecord;
      setLeads((current) =>
        current.map((item) =>
          item.id === updatedLead.id && item.leadType === updatedLead.leadType ? updatedLead : item
        )
      );
      setSelectedLead(updatedLead);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead stage');
    } finally {
      setActionKey(null);
    }
  };

  const selectedTags = selectedLead ? buildTagLines(selectedLead) : [];
  const selectedPath = selectedLead?.tracking?.pages || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p>统一查看 Contact 和 Inquiry 的来源、路径与销售状态。</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchLeads} disabled={loading || authLoading}>
          刷新
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.toolbar}>
        <div className={styles.stageFilters}>
          {(['all', 'new', 'qualified', 'won', 'junk'] as SalesStage[]).map((stage) => (
            <button
              key={stage}
              className={`${styles.filterBtn} ${salesStage === stage ? styles.active : ''}`}
              onClick={() => setSalesStage(stage)}
            >
              {stage === 'all' ? '全部' : stageLabelMap[stage]}
              <span className={styles.filterCount}>{stageCounts[stage]}</span>
            </button>
          ))}
        </div>

        <div className={styles.secondaryFilters}>
          <div className={styles.typeSwitch}>
            {(['all', 'contact', 'inquiry'] as const).map((type) => (
              <button
                key={type}
                className={`${styles.typeBtn} ${leadType === type ? styles.activeType : ''}`}
                onClick={() => setLeadType(type)}
              >
                {type === 'all' ? '全部类型' : typeLabelMap[type]}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={styles.searchInput}
            placeholder="搜索姓名、邮箱、来源、campaign"
          />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.messageList}>
          {loading || authLoading ? (
            <div className={styles.loading}>加载中...</div>
          ) : filteredLeads.length === 0 ? (
            <div className={styles.empty}>暂无匹配线索</div>
          ) : (
            <div className={styles.messages}>
              {filteredLeads.map((lead) => (
                <button
                  key={`${lead.leadType}-${lead.id}`}
                  className={`${styles.messageItem} ${selectedLead?.id === lead.id && selectedLead?.leadType === lead.leadType ? styles.selected : ''}`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className={styles.messageMeta}>
                    <div className={styles.messageTitleRow}>
                      <h3>{lead.name}</h3>
                      <span className={`${styles.leadTypeBadge} ${styles[lead.leadType]}`}>
                        {typeLabelMap[lead.leadType]}
                      </span>
                    </div>
                    <p className={styles.subject}>
                      {lead.subject || lead.company || lead.sourceLabel || '未命名来源'}
                    </p>
                    <p className={styles.preview}>{lead.message}</p>
                  </div>

                  <div className={styles.messageTime}>
                    <span className={`${styles.badge} ${styles[lead.salesStage]}`}>
                      {stageLabelMap[lead.salesStage]}
                    </span>
                    <span className={styles.time}>
                      {new Date(lead.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.messageDetail}>
          {selectedLead ? (
            <>
              <div className={styles.detailHeader}>
                <div>
                  <div className={styles.messageTitleRow}>
                    <h2>{selectedLead.name}</h2>
                    <span className={`${styles.badge} ${styles[selectedLead.salesStage]}`}>
                      {stageLabelMap[selectedLead.salesStage]}
                    </span>
                  </div>
                  <p className={styles.meta}>
                    <span>{selectedLead.email}</span>
                    {selectedLead.phone && <span>{selectedLead.phone}</span>}
                    {selectedLead.company && <span>{selectedLead.company}</span>}
                  </p>
                </div>
                <div className={styles.actions}>
                  {selectedLead.salesStage !== 'junk' && (
                    <button
                      className={styles.ghostBtn}
                      onClick={() => handleStageChange(selectedLead, 'junk')}
                      disabled={actionKey === `${selectedLead.leadType}-${selectedLead.id}-junk`}
                    >
                      标记垃圾
                    </button>
                  )}
                  {selectedLead.salesStage === 'new' || selectedLead.salesStage === 'junk' ? (
                    <button
                      className={styles.primaryBtn}
                      onClick={() => handleStageChange(selectedLead, 'qualified')}
                      disabled={actionKey === `${selectedLead.leadType}-${selectedLead.id}-qualified`}
                    >
                      标记有效询盘
                    </button>
                  ) : null}
                  {selectedLead.salesStage === 'qualified' && (
                    <button
                      className={styles.successBtn}
                      onClick={() => handleStageChange(selectedLead, 'won')}
                      disabled={actionKey === `${selectedLead.leadType}-${selectedLead.id}-won`}
                    >
                      标记已成交
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.grid}>
                <div className={styles.infoCard}>
                  <h3>线索摘要</h3>
                  <dl className={styles.infoList}>
                    <div>
                      <dt>线索类型</dt>
                      <dd>{typeLabelMap[selectedLead.leadType]}</dd>
                    </div>
                    <div>
                      <dt>提交时间</dt>
                      <dd>{new Date(selectedLead.createdAt).toLocaleString('zh-CN')}</dd>
                    </div>
                    <div>
                      <dt>客户位置（IP推断）</dt>
                      <dd>{formatLocation(selectedLead.geo)}</dd>
                    </div>
                    <div>
                      <dt>访问来源</dt>
                      <dd>{selectedLead.sourceLabel || '未知'}</dd>
                    </div>
                    <div>
                      <dt>访客类型</dt>
                      <dd>
                        {selectedLead.visitorType === 'returning'
                          ? '回头客'
                          : selectedLead.visitorType === 'first_time'
                            ? '首次访问'
                            : '未知'}
                      </dd>
                    </div>
                    <div>
                      <dt>着陆页</dt>
                      <dd>{selectedLead.landingPage || '未知'}</dd>
                    </div>
                  </dl>
                </div>

                <div className={styles.infoCard}>
                  <h3>营销参数</h3>
                  {selectedTags.length > 0 ? (
                    <div className={styles.tagList}>
                      {selectedTags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.muted}>未捕获到 UTM / click id / 自定义标签</p>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>访问路径</h3>
                {selectedPath.length > 0 ? (
                  <div className={styles.pathList}>
                    {selectedPath.map((page) => (
                      <div key={`${page.pathWithQuery}-${page.enteredAt}`} className={styles.pathItem}>
                        <div>
                          <strong>{page.label}</strong>
                          <p>{page.pathWithQuery}</p>
                        </div>
                        <span>{formatDuration(page.durationMs)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.muted}>未捕获到访问路径</p>
                )}
              </div>

              <div className={styles.detailSection}>
                <h3>客户留言</h3>
                {selectedLead.subject && (
                  <p className={styles.subjectLine}>
                    <strong>主题：</strong>
                    {selectedLead.subject}
                  </p>
                )}
                <div className={styles.message}>{selectedLead.message}</div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <p>选择一条线索查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
