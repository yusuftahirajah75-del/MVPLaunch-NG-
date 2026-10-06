-- MVPLaunch NG: Package Orders & Paystack Enhancements
-- Migration: 003_packages_and_package_orders.sql

-- 1. Allow orders table to support standalone package orders
ALTER TABLE orders ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN proposal_id DROP NOT NULL;

-- Drop unique constraint on project_id if it exists to allow nulls / multiple package orders
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_project_id_key'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_project_id_key;
    END IF;
END $$;

-- 2. Add package-specific tracking columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(30) DEFAULT 'CUSTOM_PROJECT';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS package_id VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS package_name VARCHAR(150);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(150);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(30);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(30) DEFAULT 'PENDING';

-- 3. Enhance payments table for multi-currency & exact kobo precision
ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'NGN';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount_kobo BIGINT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paystack_transaction_id VARCHAR(100);

-- 4. Create Webhook Logs table for idempotent Paystack webhook deduplication
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(150) UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    reference VARCHAR(150),
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create indexes for fast lookups on package orders and references
CREATE INDEX IF NOT EXISTS idx_orders_package_id ON orders(package_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_payments_provider_reference ON payments(provider_reference);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_reference ON webhook_logs(reference);
