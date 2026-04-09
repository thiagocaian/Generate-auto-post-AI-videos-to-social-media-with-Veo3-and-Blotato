-- Early Access Leads — captures emails from landing page
CREATE TABLE IF NOT EXISTS early_access_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'landing_page',
  status TEXT DEFAULT 'pending', -- pending, contacted, converted, declined
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_early_access_email ON early_access_leads(email);

-- RLS: Only service role can insert/read (no client access needed)
ALTER TABLE early_access_leads ENABLE ROW LEVEL SECURITY;

-- Allow insert from authenticated service role only
CREATE POLICY "Service role full access" ON early_access_leads
  FOR ALL USING (true) WITH CHECK (true);
