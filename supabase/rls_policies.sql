-- ================================================================
-- CYTRON PLATFORM — ROW LEVEL SECURITY POLICIES
-- Run this in Supabase SQL Editor to secure all tables by company
-- ================================================================

-- ---------------------------------------------------------------
-- 1. Add company_id to tables that don't have it yet
-- ---------------------------------------------------------------

-- suppliers
DO $$ BEGIN
  ALTER TABLE suppliers ADD COLUMN company_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- projects
DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN company_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- warehouse_transactions (inherit from warehouse_items)
DO $$ BEGIN
  ALTER TABLE warehouse_transactions ADD COLUMN company_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ---------------------------------------------------------------
-- 2. Drop old "Allow all" policies
-- ---------------------------------------------------------------

DROP POLICY IF EXISTS "Allow all" ON suppliers;
DROP POLICY IF EXISTS "Allow all" ON projects;
DROP POLICY IF EXISTS "Allow all" ON warehouse_items;
DROP POLICY IF EXISTS "Allow all" ON warehouse_transactions;
DROP POLICY IF EXISTS "Allow all" ON marketing_posts;
DROP POLICY IF EXISTS "Allow all" ON quotes;
DROP POLICY IF EXISTS "Allow all" ON compliance_reports;
DROP POLICY IF EXISTS "Allow all" ON work_orders;
DROP POLICY IF EXISTS "Allow all" ON subcontractors;

-- ---------------------------------------------------------------
-- 3. Enable RLS on all tables (idempotent)
-- ---------------------------------------------------------------

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- 4. Create company isolation policies
--    Users can only see/edit rows belonging to their company
-- ---------------------------------------------------------------

-- Helper: get user's company_id
-- (used in policy expressions via subquery)

-- suppliers
CREATE POLICY "company_isolation" ON suppliers FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
) WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);

-- projects
CREATE POLICY "company_isolation" ON projects FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
) WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);

-- warehouse_items
CREATE POLICY "company_isolation" ON warehouse_items FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
) WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);

-- warehouse_transactions
CREATE POLICY "company_isolation" ON warehouse_transactions FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
) WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);

-- marketing_posts
CREATE POLICY "company_isolation" ON marketing_posts FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
) WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);

-- quotes
CREATE POLICY "company_isolation" ON quotes FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
) WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);

-- compliance_reports (add company_id if missing)
DO $$ BEGIN
  ALTER TABLE compliance_reports ADD COLUMN company_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE POLICY "company_isolation" ON compliance_reports FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
) WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);

-- work_orders (add company_id if missing)
DO $$ BEGIN
  ALTER TABLE work_orders ADD COLUMN company_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE POLICY "company_isolation" ON work_orders FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
) WITH CHECK (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);

-- ---------------------------------------------------------------
-- 5. Grant company_members SELECT to authenticated users
--    (needed for the policy subqueries to work)
-- ---------------------------------------------------------------

ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_membership" ON company_members;
CREATE POLICY "users_read_own_membership" ON company_members
  FOR SELECT USING (user_id = auth.uid());

-- ================================================================
-- IMPORTANT: After running this, update existing rows to set
-- company_id on suppliers, projects, warehouse_transactions,
-- compliance_reports, and work_orders tables.
--
-- Example:
-- UPDATE suppliers SET company_id = 'YOUR_COMPANY_UUID';
-- UPDATE projects SET company_id = 'YOUR_COMPANY_UUID';
-- ================================================================
