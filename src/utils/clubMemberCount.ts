import { supabase } from '@/lib/supabase';

/**
 * Updates a club's member_count by counting actual members in the club_members table
 * This ensures the count is always accurate and consistent
 */
export async function updateClubMemberCount(clubId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Count actual members in the club_members table
    const { count: memberCount, error: countError } = await supabase
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId);

    if (countError) {
      console.error('Failed to get member count:', countError);
      return { success: false, error: countError.message };
    }

    if (memberCount === null) {
      console.error('Member count is null');
      return { success: false, error: 'Member count is null' };
    }

    // Update the club's member_count field
    const { error: updateError } = await supabase
      .from('clubs')
      .update({ 
        member_count: memberCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', clubId);

    if (updateError) {
      console.error('Failed to update member count:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log(`Updated member count for club ${clubId}: ${memberCount} members`);
    return { success: true };

  } catch (error) {
    console.error('Error updating club member count:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 