-- Test the function manually
SELECT * FROM get_popular_proposals(30, 20);

-- Also test with a shorter time period to see if views are recent
SELECT * FROM get_popular_proposals(1, 20);

-- Check what's in view_logs for debugging
SELECT 
  vl.proposal_id,
  vl.viewed_at,
  p.title,
  p.slug
FROM view_logs vl
JOIN proposals p ON vl.proposal_id = p.id
ORDER BY vl.viewed_at DESC;
