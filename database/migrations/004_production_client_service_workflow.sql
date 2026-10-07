-- MVPLaunch NG: Production Client Service Workflow & Role Pipelines
-- Migration: 004_production_client_service_workflow.sql

-- 1. Relax and update projects status constraint to support full client service lifecycle
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'projects_status_check'
    ) THEN
        ALTER TABLE projects DROP CONSTRAINT projects_status_check;
    END IF;
END $$;

-- 2. Add rich project scoping, submission & delivery columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_code VARCHAR(30) UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS organization_name VARCHAR(150);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS problem_statement TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_users TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS proposed_solution TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS core_features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS nice_to_have_features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expected_outcome TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS existing_product_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS competitor_references TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS design_preferences TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS technical_requirements TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS preferred_deadline VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS selected_package_id VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS selected_package_name VARCHAR(150);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(150);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS additional_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Scoping & Engineer Assignment metadata
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'MEDIUM';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS admin_instructions TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS internal_deadline DATE;

-- Development & Delivery tracking
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completed_features TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS known_limitations TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deliverable_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS submission_status VARCHAR(30) DEFAULT 'SUBMITTED';

-- 3. Enhance orders table to track project link and submission state
ALTER TABLE orders ADD COLUMN IF NOT EXISTS project_submitted BOOLEAN DEFAULT FALSE;

-- 4. Enhance users table for software engineer profiles, availability and workload
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_status VARCHAR(30) DEFAULT 'AVAILABLE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS specializations JSONB DEFAULT '[]'::jsonb;

-- 5. Create project_notes table for Admin ↔ Engineer internal communications
CREATE TABLE IF NOT EXISTS project_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    author_role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    note_type VARCHAR(30) DEFAULT 'INTERNAL',
    is_internal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create project_deliverables table for engineer deliverable submissions & admin reviews
CREATE TABLE IF NOT EXISTS project_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    developer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    staging_url TEXT,
    repo_url TEXT,
    production_url TEXT,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'SUBMITTED',
    admin_feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ
);

-- 7. Add performance indexes for real-time querying across pipelines
CREATE INDEX IF NOT EXISTS idx_projects_developer_id ON projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_order_id ON projects(order_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_project_code ON projects(project_code);
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_project_id ON project_deliverables(project_id);
