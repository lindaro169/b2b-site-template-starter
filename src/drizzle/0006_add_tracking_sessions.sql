-- Migration: Add server-side attribution session storage

CREATE TABLE IF NOT EXISTS tracking_sessions (
  session_id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  visit_count INTEGER NOT NULL DEFAULT 1,
  visitor_type TEXT NOT NULL DEFAULT 'first_time',
  started_at TEXT NOT NULL,
  last_activity_at TEXT NOT NULL,
  current_page_started_at INTEGER NOT NULL,
  landing_page_json TEXT NOT NULL,
  source_json TEXT NOT NULL,
  attribution_json TEXT NOT NULL,
  pages_json TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tracking_sessions_visitor_id ON tracking_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_last_activity ON tracking_sessions(last_activity_at);
