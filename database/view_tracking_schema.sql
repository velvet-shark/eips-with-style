-- Create view_logs table for tracking proposal views
CREATE TABLE view_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying by proposal_id and date
CREATE INDEX idx_view_logs_proposal_date ON view_logs(proposal_id, viewed_at);

-- Create index for efficient querying by date range
CREATE INDEX idx_view_logs_date ON view_logs(viewed_at);

-- Enable Row Level Security (RLS) for security
ALTER TABLE view_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to insert view logs
CREATE POLICY "Anyone can insert view logs" ON view_logs
  FOR INSERT TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated users to read view logs
CREATE POLICY "Authenticated users can read view logs" ON view_logs
  FOR SELECT TO authenticated
  USING (true);

-- Create a function to get popular proposals in the last 30 days
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
    COALESCE(recent_views.view_count, 0) as view_count
  FROM proposals p
  LEFT JOIN (
    SELECT 
      proposal_id,
      COUNT(*) as view_count
    FROM view_logs 
    WHERE viewed_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY proposal_id
  ) recent_views ON p.id = recent_views.proposal_id
  ORDER BY view_count DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
