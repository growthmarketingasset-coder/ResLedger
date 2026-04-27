-- Migration v4: Books tracker
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  total_pages INTEGER,
  current_page INTEGER DEFAULT 0,
  status TEXT DEFAULT 'reading', -- 'to_read', 'reading', 'completed', 'paused'
  cover_url TEXT,
  notes TEXT,
  key_takeaways TEXT,
  industry TEXT,
  impact_level TEXT DEFAULT 'medium',
  started_at DATE,
  completed_at DATE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own books" ON books FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id);
