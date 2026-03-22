-- ================================================================
-- MACO ELECTRICS — WAREHOUSE MANAGEMENT SYSTEM
-- Cytron Platform | Supabase Schema
-- ================================================================

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  telegram_id VARCHAR(100),
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  client VARCHAR(200),
  budget DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouse items table
CREATE TABLE IF NOT EXISTS warehouse_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(20) DEFAULT 'un',
  current_stock DECIMAL(10,2) DEFAULT 0,
  minimum_stock DECIMAL(10,2) DEFAULT 0,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id),
  location VARCHAR(100),
  qr_code VARCHAR(100) UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouse transactions table
CREATE TABLE IF NOT EXISTS warehouse_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES warehouse_items(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  transaction_type VARCHAR(10) CHECK (transaction_type IN ('entry', 'exit')) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  performed_by VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on warehouse_items
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_warehouse_items_updated_at
  BEFORE UPDATE ON warehouse_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View: items below minimum stock
CREATE OR REPLACE VIEW low_stock_items AS
  SELECT
    wi.*,
    s.name as supplier_name,
    s.email as supplier_email,
    s.telegram_id as supplier_telegram
  FROM warehouse_items wi
  LEFT JOIN suppliers s ON s.id = wi.supplier_id
  WHERE wi.current_stock <= wi.minimum_stock;

-- View: cost per project
CREATE OR REPLACE VIEW project_costs AS
  SELECT
    p.id,
    p.name as project_name,
    p.client,
    p.status,
    COUNT(wt.id) as total_transactions,
    SUM(CASE WHEN wt.transaction_type = 'exit' THEN wt.total_cost ELSE 0 END) as total_material_cost,
    p.budget,
    p.budget - SUM(CASE WHEN wt.transaction_type = 'exit' THEN wt.total_cost ELSE 0 END) as budget_remaining
  FROM projects p
  LEFT JOIN warehouse_transactions wt ON wt.project_id = p.id
  GROUP BY p.id, p.name, p.client, p.status, p.budget;

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_transactions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read/write (adjust per role later)
CREATE POLICY "Allow all" ON suppliers FOR ALL USING (true);
CREATE POLICY "Allow all" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all" ON warehouse_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON warehouse_transactions FOR ALL USING (true);

-- ================================================================
-- SEED DATA — Maco Electrics demo items
-- ================================================================
INSERT INTO suppliers (name, email, phone, category) VALUES
  ('Clipsal Australia', 'orders@clipsal.com.au', '1300 202 203', 'Electrical Components'),
  ('Cabac', 'sales@cabac.com.au', '07 3290 3888', 'Cables & Connectors'),
  ('Dial Before You Dig QLD', 'admin@1100.com.au', '1100', 'Safety'),
  ('Philips Lighting AU', 'lighting@philips.com.au', '1300 360 100', 'DALI Lighting');

INSERT INTO projects (name, client, budget, status) VALUES
  ('Madeline Tower — 40L Broadbeach', 'Mosaic Property Group', 850000, 'active'),
  ('Miles Residences — Gold Coast', 'Hutchinson Builders', 420000, 'active'),
  ('Griffith University — Student Hub', 'Griffith University', 180000, 'active');

INSERT INTO warehouse_items (sku, name, category, unit, current_stock, minimum_stock, unit_cost, location, qr_code) VALUES
  ('CAB-2.5-BLK', 'Cabo elétrico 2.5mm² preto', 'Cabos', 'm', 500, 100, 1.20, 'Prateleira A1', 'QR-CAB-2.5-BLK'),
  ('CAB-4-RED', 'Cabo elétrico 4mm² vermelho', 'Cabos', 'm', 300, 100, 1.80, 'Prateleira A2', 'QR-CAB-4-RED'),
  ('CAB-6-BLU', 'Cabo elétrico 6mm² azul', 'Cabos', 'm', 150, 80, 2.40, 'Prateleira A3', 'QR-CAB-6-BLU'),
  ('DIS-20A', 'Disjuntor 20A bipolar', 'Disjuntores', 'un', 45, 20, 28.50, 'Prateleira B1', 'QR-DIS-20A'),
  ('DIS-32A', 'Disjuntor 32A bipolar', 'Disjuntores', 'un', 30, 15, 38.00, 'Prateleira B2', 'QR-DIS-32A'),
  ('LUM-DALI-LED', 'Luminária DALI LED 18W embutida', 'Iluminação DALI', 'un', 80, 30, 145.00, 'Prateleira C1', 'QR-LUM-DALI-LED'),
  ('DALI-CTR', 'Controlador DALI 2ch', 'Iluminação DALI', 'un', 12, 5, 320.00, 'Prateleira C2', 'QR-DALI-CTR'),
  ('PAIN-12C', 'Painel elétrico 12 circuitos', 'Painéis', 'un', 8, 3, 280.00, 'Prateleira D1', 'QR-PAIN-12C'),
  ('PAIN-24C', 'Painel elétrico 24 circuitos', 'Painéis', 'un', 4, 2, 520.00, 'Prateleira D2', 'QR-PAIN-24C'),
  ('CON-20MM', 'Conduit PVC 20mm (barra 3m)', 'Conduits', 'un', 120, 40, 4.50, 'Prateleira E1', 'QR-CON-20MM'),
  ('CON-25MM', 'Conduit PVC 25mm (barra 3m)', 'Conduits', 'un', 90, 40, 6.00, 'Prateleira E2', 'QR-CON-25MM'),
  ('NBN-CAT6', 'Cabo Cat6 UTP (rolo 305m)', 'Comunicações', 'un', 6, 3, 185.00, 'Prateleira F1', 'QR-NBN-CAT6');
