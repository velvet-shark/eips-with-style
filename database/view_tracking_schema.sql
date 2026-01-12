-- Create view_logs table for tracking proposal views
CREATE TABLE IF NOT EXISTS view_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roll up daily view counts for fast popularity queries
CREATE TABLE IF NOT EXISTS proposal_daily_views (
  day DATE NOT NULL,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  view_count BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (day, proposal_id)
);

-- Create index for efficient querying by proposal_id and date
CREATE INDEX IF NOT EXISTS idx_view_logs_proposal_date ON view_logs(proposal_id, viewed_at);

-- Create index for efficient querying by date range
CREATE INDEX IF NOT EXISTS idx_view_logs_date ON view_logs(viewed_at);

-- Indexes for rollups
CREATE INDEX IF NOT EXISTS idx_proposal_daily_views_day ON proposal_daily_views(day);
CREATE INDEX IF NOT EXISTS idx_proposal_daily_views_proposal_day ON proposal_daily_views(proposal_id, day);

-- Enable Row Level Security (RLS) for security
ALTER TABLE view_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_daily_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to insert view logs
DROP POLICY IF EXISTS "Anyone can insert view logs" ON view_logs;
CREATE POLICY "Anyone can insert view logs" ON view_logs
  FOR INSERT TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated users to read view logs
DROP POLICY IF EXISTS "Authenticated users can read view logs" ON view_logs;
CREATE POLICY "Authenticated users can read view logs" ON view_logs
  FOR SELECT TO authenticated
  USING (true);

-- Prevent direct access to rollups (queries should use the security definer function)
DROP POLICY IF EXISTS "No direct access to rollups" ON proposal_daily_views;
CREATE POLICY "No direct access to rollups" ON proposal_daily_views
  FOR ALL TO anon
  USING (false)
  WITH CHECK (false);

-- Increment rollups on each view log insert
CREATE OR REPLACE FUNCTION increment_proposal_daily_views()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.proposal_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO proposal_daily_views (day, proposal_id, view_count)
  VALUES (COALESCE(NEW.viewed_at, NOW())::date, NEW.proposal_id, 1)
  ON CONFLICT (day, proposal_id)
  DO UPDATE SET view_count = proposal_daily_views.view_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS view_logs_rollup ON view_logs;
CREATE TRIGGER view_logs_rollup
AFTER INSERT ON view_logs
FOR EACH ROW
EXECUTE FUNCTION increment_proposal_daily_views();

-- Backfill helper for existing view logs
CREATE OR REPLACE FUNCTION backfill_proposal_daily_views(start_date DATE DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  from_date DATE;
BEGIN
  SELECT COALESCE(start_date, MIN(viewed_at)::date) INTO from_date FROM view_logs;
  IF from_date IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO proposal_daily_views (day, proposal_id, view_count)
  SELECT
    viewed_at::date AS day,
    proposal_id,
    COUNT(*) AS view_count
  FROM view_logs
  WHERE viewed_at::date >= from_date
  GROUP BY viewed_at::date, proposal_id
  ON CONFLICT (day, proposal_id)
  DO UPDATE SET view_count = EXCLUDED.view_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION backfill_proposal_daily_views(DATE) FROM PUBLIC;

-- After deploying, run: SELECT backfill_proposal_daily_views(); to seed rollups

-- Create a function to get popular proposals in the last N days using rollups
CREATE OR REPLACE FUNCTION get_popular_proposals(days_back INTEGER DEFAULT 30, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id uuid,
  proposal_type TEXT,
  number INTEGER,
  slug TEXT,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  featured BOOLEAN,
  view_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.proposal_type,
    p.number,
    p.slug,
    p.title,
    p.created_at,
    p.featured,
    COALESCE(SUM(dv.view_count), 0)::bigint AS view_count
  FROM proposals p
  LEFT JOIN proposal_daily_views dv
    ON dv.proposal_id = p.id
   AND dv.day >= CURRENT_DATE - days_back
  GROUP BY p.id, p.proposal_type, p.number, p.slug, p.title, p.created_at, p.featured
  ORDER BY view_count DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_popular_proposals(INTEGER, INTEGER) TO anon, authenticated;
