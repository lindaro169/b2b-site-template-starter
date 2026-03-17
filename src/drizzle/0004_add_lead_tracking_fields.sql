-- Migration: Add lead tracking, attribution, and sales stage fields

ALTER TABLE contacts ADD COLUMN sales_stage TEXT DEFAULT 'new';
ALTER TABLE contacts ADD COLUMN sales_stage_updated_at TEXT;
ALTER TABLE contacts ADD COLUMN visitor_id TEXT;
ALTER TABLE contacts ADD COLUMN session_id TEXT;
ALTER TABLE contacts ADD COLUMN visitor_type TEXT;
ALTER TABLE contacts ADD COLUMN landing_page TEXT;
ALTER TABLE contacts ADD COLUMN source_label TEXT;
ALTER TABLE contacts ADD COLUMN source_platform TEXT;
ALTER TABLE contacts ADD COLUMN source_channel TEXT;
ALTER TABLE contacts ADD COLUMN utm_source TEXT;
ALTER TABLE contacts ADD COLUMN utm_medium TEXT;
ALTER TABLE contacts ADD COLUMN utm_campaign TEXT;
ALTER TABLE contacts ADD COLUMN utm_term TEXT;
ALTER TABLE contacts ADD COLUMN utm_content TEXT;
ALTER TABLE contacts ADD COLUMN click_ids TEXT;
ALTER TABLE contacts ADD COLUMN custom_tags TEXT;
ALTER TABLE contacts ADD COLUMN tracking_json TEXT;
ALTER TABLE contacts ADD COLUMN geo_country TEXT;
ALTER TABLE contacts ADD COLUMN geo_region TEXT;
ALTER TABLE contacts ADD COLUMN geo_city TEXT;
ALTER TABLE contacts ADD COLUMN google_submit_sent_at TEXT;
ALTER TABLE contacts ADD COLUMN google_qualified_sent_at TEXT;
ALTER TABLE contacts ADD COLUMN google_won_sent_at TEXT;
ALTER TABLE contacts ADD COLUMN google_sync_error TEXT;

ALTER TABLE inquiries ADD COLUMN sales_stage TEXT DEFAULT 'new';
ALTER TABLE inquiries ADD COLUMN sales_stage_updated_at TEXT;
ALTER TABLE inquiries ADD COLUMN visitor_id TEXT;
ALTER TABLE inquiries ADD COLUMN session_id TEXT;
ALTER TABLE inquiries ADD COLUMN visitor_type TEXT;
ALTER TABLE inquiries ADD COLUMN landing_page TEXT;
ALTER TABLE inquiries ADD COLUMN source_label TEXT;
ALTER TABLE inquiries ADD COLUMN source_platform TEXT;
ALTER TABLE inquiries ADD COLUMN source_channel TEXT;
ALTER TABLE inquiries ADD COLUMN utm_source TEXT;
ALTER TABLE inquiries ADD COLUMN utm_medium TEXT;
ALTER TABLE inquiries ADD COLUMN utm_campaign TEXT;
ALTER TABLE inquiries ADD COLUMN utm_term TEXT;
ALTER TABLE inquiries ADD COLUMN utm_content TEXT;
ALTER TABLE inquiries ADD COLUMN click_ids TEXT;
ALTER TABLE inquiries ADD COLUMN custom_tags TEXT;
ALTER TABLE inquiries ADD COLUMN tracking_json TEXT;
ALTER TABLE inquiries ADD COLUMN geo_country TEXT;
ALTER TABLE inquiries ADD COLUMN geo_region TEXT;
ALTER TABLE inquiries ADD COLUMN geo_city TEXT;
ALTER TABLE inquiries ADD COLUMN google_submit_sent_at TEXT;
ALTER TABLE inquiries ADD COLUMN google_qualified_sent_at TEXT;
ALTER TABLE inquiries ADD COLUMN google_won_sent_at TEXT;
ALTER TABLE inquiries ADD COLUMN google_sync_error TEXT;

UPDATE contacts
SET sales_stage = 'new'
WHERE sales_stage IS NULL;

UPDATE inquiries
SET sales_stage = 'new'
WHERE sales_stage IS NULL;
