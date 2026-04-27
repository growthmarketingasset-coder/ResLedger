-- ============================================================
-- ResLedge v2 Migration
-- Run in Supabase SQL Editor AFTER the base schema.sql
-- ============================================================

-- 1. New columns on learnings
ALTER TABLE learnings
  ADD COLUMN IF NOT EXISTS action_plan TEXT,
  ADD COLUMN IF NOT EXISTS impact_level TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS review_date DATE,
  ADD COLUMN IF NOT EXISTS is_reviewed BOOLEAN DEFAULT FALSE;

-- 2. New columns on resources
ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS action_plan TEXT,
  ADD COLUMN IF NOT EXISTS impact_level TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS review_date DATE,
  ADD COLUMN IF NOT EXISTS is_reviewed BOOLEAN DEFAULT FALSE;

-- 3. New columns on ideas
ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS action_plan TEXT,
  ADD COLUMN IF NOT EXISTS impact_level TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS review_date DATE,
  ADD COLUMN IF NOT EXISTS is_reviewed BOOLEAN DEFAULT FALSE;

-- 4. Templates: reference URL + impact
ALTER TABLE templates
  ADD COLUMN IF NOT EXISTS reference_url TEXT,
  ADD COLUMN IF NOT EXISTS action_plan TEXT,
  ADD COLUMN IF NOT EXISTS impact_level TEXT DEFAULT 'medium';

-- 5. Tools: icon cache + action plan + impact + review
ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS icon_url TEXT,
  ADD COLUMN IF NOT EXISTS action_plan TEXT,
  ADD COLUMN IF NOT EXISTS impact_level TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS review_date DATE,
  ADD COLUMN IF NOT EXISTS is_reviewed BOOLEAN DEFAULT FALSE;

-- 6. AI Strategy section (new table)
CREATE TABLE IF NOT EXISTS ai_strategies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  objective TEXT,
  approach TEXT,
  tools_used TEXT,
  outcome TEXT,
  status TEXT DEFAULT 'draft',
  impact_level TEXT DEFAULT 'medium',
  industry TEXT,
  action_plan TEXT,
  review_date DATE,
  is_reviewed BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_strategies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own ai_strategies" ON ai_strategies;
CREATE POLICY "Users can manage own ai_strategies"
  ON ai_strategies FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_strategies_user_id ON ai_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_learnings_reviewed ON learnings(user_id, is_reviewed);
CREATE INDEX IF NOT EXISTS idx_resources_reviewed ON resources(user_id, is_reviewed);
CREATE INDEX IF NOT EXISTS idx_ideas_impact ON ideas(user_id, impact_level);

-- Supporting links for AI Strategy (stored as JSON array)
ALTER TABLE ai_strategies
  ADD COLUMN IF NOT EXISTS supporting_links TEXT;
