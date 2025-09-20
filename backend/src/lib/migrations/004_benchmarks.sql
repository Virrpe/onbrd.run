-- Cohort fields
ALTER TABLE audits
  ADD COLUMN IF NOT EXISTS device TEXT CHECK (device IN ('desktop','mobile')) DEFAULT 'desktop',
  ADD COLUMN IF NOT EXISTS cohort TEXT CHECK (cohort IN ('global','saas','ecommerce','content')) DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS region TEXT;

-- Indexes for windows
CREATE INDEX IF NOT EXISTS idx_audits_cohort_device_created ON audits (cohort, device, created_at DESC);