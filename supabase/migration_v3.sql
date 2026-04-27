-- ============================================================
-- ResLedge v3 Migration
-- Run AFTER migration_v2.sql
-- ============================================================

-- Workshop Videos
CREATE TABLE IF NOT EXISTS workshop_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  module_number INTEGER,
  duration TEXT,
  instructor TEXT,
  course_name TEXT,
  notes TEXT,
  action_plan TEXT,
  impact_level TEXT DEFAULT 'medium',
  is_watched BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workshop_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workshop_videos" ON workshop_videos FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_workshop_videos_user ON workshop_videos(user_id);

-- Case Studies
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  problem TEXT,
  solution TEXT,
  result TEXT,
  industry TEXT,
  client_context TEXT,
  tools_used TEXT,
  url TEXT,
  action_plan TEXT,
  impact_level TEXT DEFAULT 'medium',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own case_studies" ON case_studies FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_user ON case_studies(user_id);
