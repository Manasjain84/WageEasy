-- ==============================================================================
-- FACTORY ATTENDANCE & PAYROLL - DATABASE SCHEMA (SUPABASE POSTGRES)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE employee_status AS ENUM ('pending', 'active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'incomplete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payroll_cycle_status AS ENUM ('draft', 'approved', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('employer', 'worker');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ORGANIZATIONS TABLE
-- Stores factory / enterprise details, join code, owner link to auth.users, and custom wage rules
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    join_code VARCHAR(12) NOT NULL UNIQUE,
    wage_rules JSONB NOT NULL DEFAULT '{
        "standard_daily_hours": 8,
        "ot_rate_multiplier": 1.5,
        "work_days_per_month": 26,
        "currency": "INR"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. EMPLOYEES TABLE
-- Stores factory worker & supervisor profiles linked to organizations and Supabase auth users
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    photo_url TEXT,
    wage_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    role user_role NOT NULL DEFAULT 'worker',
    status employee_status NOT NULL DEFAULT 'pending',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_auth_user_id UNIQUE (auth_user_id)
);

-- 4. ATTENDANCE RECORDS TABLE
-- Stores daily check-in / check-out timestamps, computed hours, and manual overrides
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    hours_worked NUMERIC(5, 2) DEFAULT 0.00,
    ot_hours NUMERIC(5, 2) DEFAULT 0.00,
    status attendance_status NOT NULL DEFAULT 'incomplete',
    is_manual_edit BOOLEAN NOT NULL DEFAULT FALSE,
    edited_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT unique_employee_daily_attendance UNIQUE (employee_id, date)
);

-- 5. PAYROLL CYCLES TABLE
-- Represents periodic salary batch processing (e.g. monthly or bi-weekly)
CREATE TABLE IF NOT EXISTS payroll_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status payroll_cycle_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_org_cycle_period UNIQUE (org_id, period_start, period_end)
);

-- 6. PAYSLIPS TABLE
-- Detailed generated payslip records for each employee within a cycle
CREATE TABLE IF NOT EXISTS payslips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_cycle_id UUID NOT NULL REFERENCES payroll_cycles(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    days_present INTEGER NOT NULL DEFAULT 0,
    total_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    ot_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    base_pay NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ot_pay NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deductions NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    final_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_cycle_employee_payslip UNIQUE (payroll_cycle_id, employee_id)
);

-- ==============================================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_join_code ON organizations(join_code);
CREATE INDEX IF NOT EXISTS idx_employees_org_id ON employees(org_id);
CREATE INDEX IF NOT EXISTS idx_employees_auth_user_id ON employees(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_org_id ON attendance_records(org_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_payroll_cycles_org_id ON payroll_cycles(org_id);
CREATE INDEX IF NOT EXISTS idx_payslips_payroll_cycle_id ON payslips(payroll_cycle_id);
CREATE INDEX IF NOT EXISTS idx_payslips_employee_id ON payslips(employee_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;

-- 1. Organizations Policies
CREATE POLICY "Allow authenticated users to read organizations by join code"
ON organizations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to create organizations"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Allow owners to update their organization"
ON organizations FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- 2. Employees Policies
CREATE POLICY "Allow users to read their own employee profile or their org members"
ON employees FOR SELECT
TO authenticated
USING (
    auth_user_id = auth.uid() OR
    org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);

CREATE POLICY "Allow authenticated users to create employee profile"
ON employees FOR INSERT
TO authenticated
WITH CHECK (auth_user_id = auth.uid() OR org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid()));

CREATE POLICY "Allow org owners to update employee status and wages"
ON employees FOR UPDATE
TO authenticated
USING (org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid()))
WITH CHECK (org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid()));

-- 3. Attendance Policies
CREATE POLICY "Workers can read and insert their own attendance"
ON attendance_records FOR ALL
TO authenticated
USING (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()) OR
    org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);

-- 4. Payroll & Payslips Policies
CREATE POLICY "Owners can manage payroll cycles and payslips"
ON payroll_cycles FOR ALL
TO authenticated
USING (org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid()));

CREATE POLICY "Workers can read their own payslips"
ON payslips FOR SELECT
TO authenticated
USING (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()) OR
    payroll_cycle_id IN (SELECT id FROM payroll_cycles WHERE org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid()))
);
