import { createClient } from "@/utils/supabase/client";

export async function trackProposalView(proposalId: string) {
  const supabase = createClient();
  
  try {
    // Get user's IP (in a real app, you'd get this from headers)
    const userAgent = navigator.userAgent;
    
    const { error } = await supabase
      .from('view_logs')
      .insert({
        proposal_id: proposalId,
        user_agent: userAgent,
        viewed_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error tracking view:', error);
    }
  } catch (error) {
    console.error('Error tracking view:', error);
  }
}

export async function getPopularProposals(daysBack: number = 30, limit: number = 20) {
  const supabase = createClient();
  
  try {
    console.log('Fetching popular proposals with params:', { daysBack, limit });
    
    const { data, error } = await supabase
      .rpc('get_popular_proposals', { 
        days_back: daysBack, 
        limit_count: limit 
      });
    
    if (error) {
      console.error('Error fetching popular proposals:', error);
      return [];
    }
    
    console.log('Popular proposals data:', data);
    console.log('First 3 popular proposals:', data?.slice(0, 3));
    return data || [];
  } catch (error) {
    console.error('Error fetching popular proposals:', error);
    return [];
  }
}
