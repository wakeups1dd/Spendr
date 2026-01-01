-- Migration: Add SMS parsing tables and update transactions table
-- Created: Phase 1 of SMS Parsing Feature Implementation

-- Step 1: Verify/Add columns to transactions table for SMS support
-- Check if columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add raw_sms column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'raw_sms'
    ) THEN
        ALTER TABLE transactions ADD COLUMN raw_sms TEXT;
    END IF;

    -- Add parsed_json column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'parsed_json'
    ) THEN
        ALTER TABLE transactions ADD COLUMN parsed_json JSONB;
    END IF;

    -- Ensure source column exists (should already exist based on codebase)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'source'
    ) THEN
        ALTER TABLE transactions ADD COLUMN source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'sms', 'import'));
    END IF;
END $$;

-- Step 2: Create sms_sync_settings table
CREATE TABLE IF NOT EXISTS sms_sync_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT,
    bank_name TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- One setting per user
);

-- Step 3: Create parsed_transactions_queue table
CREATE TABLE IF NOT EXISTS parsed_transactions_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    raw_sms TEXT NOT NULL,
    parsed_json JSONB,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
    suggested_transaction JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_sync_settings_user_id ON sms_sync_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_parsed_transactions_queue_user_id ON parsed_transactions_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_parsed_transactions_queue_status ON parsed_transactions_queue(status);
CREATE INDEX IF NOT EXISTS idx_parsed_transactions_queue_created_at ON parsed_transactions_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_raw_sms ON transactions(raw_sms) WHERE raw_sms IS NOT NULL;

-- Step 5: Enable Row Level Security (RLS)
ALTER TABLE sms_sync_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsed_transactions_queue ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for sms_sync_settings
-- Users can only read/update their own settings
CREATE POLICY "Users can view their own SMS sync settings"
    ON sms_sync_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SMS sync settings"
    ON sms_sync_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SMS sync settings"
    ON sms_sync_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SMS sync settings"
    ON sms_sync_settings FOR DELETE
    USING (auth.uid() = user_id);

-- Step 7: Create RLS policies for parsed_transactions_queue
-- Users can only access their own queued transactions
CREATE POLICY "Users can view their own queued transactions"
    ON parsed_transactions_queue FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own queued transactions"
    ON parsed_transactions_queue FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queued transactions"
    ON parsed_transactions_queue FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queued transactions"
    ON parsed_transactions_queue FOR DELETE
    USING (auth.uid() = user_id);

-- Step 8: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 9: Create triggers to automatically update updated_at
CREATE TRIGGER update_sms_sync_settings_updated_at 
    BEFORE UPDATE ON sms_sync_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parsed_transactions_queue_updated_at 
    BEFORE UPDATE ON parsed_transactions_queue 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Create a function to clean up old rejected/approved items from queue
-- (Optional: for maintenance, can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_old_queue_items(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM parsed_transactions_queue
    WHERE status IN ('approved', 'rejected')
    AND created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

