-- ================================================================
-- CYTRON PLATFORM — JOBS & INVOICES SCHEMA
-- Fase 1: ServiceM8-equivalent Job Management
-- ================================================================

-- ── JOBS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID,
  job_number VARCHAR(20) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  client_name VARCHAR(200),
  client_email VARCHAR(200),
  client_phone VARCHAR(50),
  site_address VARCHAR(500),
  status VARCHAR(30) DEFAULT 'enquiry'
    CHECK (status IN (
      'enquiry', 'quoted', 'scheduled', 'in_progress',
      'completed', 'invoiced', 'paid'
    )),
  priority VARCHAR(10) DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  assigned_to VARCHAR(200),
  quote_id UUID,
  scheduled_date DATE,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  estimated_hours DECIMAL(6,2),
  actual_hours DECIMAL(6,2),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  total_value DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_quote ON jobs(quote_id);

-- ── INVOICES TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID,
  invoice_number VARCHAR(20) NOT NULL,
  job_id UUID,
  quote_id UUID,
  client_name VARCHAR(200) NOT NULL,
  client_email VARCHAR(200),
  client_address VARCHAR(500),
  items JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 10.00,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'void')),
  payment_method VARCHAR(50),
  payment_date TIMESTAMPTZ,
  due_date DATE,
  notes TEXT,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job ON invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ── RLS POLICIES ──────────────────────────────────────────
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_isolation" ON jobs FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
) WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);

CREATE POLICY "company_isolation" ON invoices FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
) WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);

-- ── AUTO-UPDATE TRIGGERS ──────────────────────────────────
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── DASHBOARD VIEW ────────────────────────────────────────
CREATE OR REPLACE VIEW job_stats AS
  SELECT
    j.company_id,
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE j.status = 'enquiry') as enquiries,
    COUNT(*) FILTER (WHERE j.status = 'scheduled') as scheduled,
    COUNT(*) FILTER (WHERE j.status IN ('in_progress')) as in_progress,
    COUNT(*) FILTER (WHERE j.status = 'completed') as completed,
    COUNT(*) FILTER (WHERE j.status IN ('invoiced', 'paid')) as invoiced,
    COALESCE(SUM(j.total_value), 0) as pipeline_value
  FROM jobs j
  GROUP BY j.company_id;
