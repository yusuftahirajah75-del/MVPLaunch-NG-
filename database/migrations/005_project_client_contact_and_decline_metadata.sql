-- Migration: 005_project_client_contact_and_decline_metadata.sql
-- MVPLaunch NG: Enhanced Client Contact Details & Developer Assignment/Decline Tracking

ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_contact_name VARCHAR(150);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_contact_email VARCHAR(150);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_contact_phone VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS decline_reason TEXT;
