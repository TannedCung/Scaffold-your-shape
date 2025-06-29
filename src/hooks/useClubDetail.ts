import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { clubApi } from '@/lib/api';
import { 
  Club, 
  ClubMember, 
  ClubMemberDb, 
  mapClubMemberDbToClubMember 
} from '@/types';

interface ClubDetailData extends Club {
  isMember: boolean;
  userMembership?: ClubMember;
  membersList: ClubMember[];
  adminCount: number;
  memberCount: number;
}

export function useClubDetail(clubId: string) {
  const { data: session } = useSession();
  const [club, setClub] = useState<ClubDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClubData = async () => {
    if (!clubId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch club details with membership status included
      const { data: apiResponse, error: clubError } = await clubApi.getById(clubId);
      
      if (clubError) {
        throw new Error(clubError);
      }

      if (!apiResponse) {
        throw new Error('Club not found');
      }

      // Extract the actual club data from the nested response
      const clubData = (apiResponse as unknown as { data: unknown }).data || apiResponse;

      // Convert snake_case user_membership to camelCase if it exists
      let userMembership: ClubMember | undefined = undefined;
      if ((clubData as unknown as { user_membership?: ClubMemberDb }).user_membership) {
        const membershipDb = (clubData as unknown as { user_membership: ClubMemberDb }).user_membership;
        userMembership = mapClubMemberDbToClubMember(membershipDb);
      }

      // Extract club properties with proper type conversion
      const clubDataTyped = clubData as unknown as {
        id: string;
        name: string;
        description: string;
        creatorId: string;
        imageUrl?: string;
        backgroundImageUrl?: string;
        memberCount: number;
        isPrivate: boolean;
        created_at: string;
        updatedAt: string;
        is_member?: boolean;
        members_list?: ClubMemberDb[];
      };

      // Convert members list from DB format to TypeScript format
      const membersList: ClubMember[] = (clubDataTyped.members_list || []).map(memberDb => 
        mapClubMemberDbToClubMember(memberDb)
      );

      // Calculate admin and member counts
      const adminCount = membersList.filter(member => member.role === 'admin').length;
      const actualMemberCount = membersList.length;

      const enrichedClub: ClubDetailData = {
        id: clubDataTyped.id,
        name: clubDataTyped.name,
        description: clubDataTyped.description,
        creatorId: clubDataTyped.creatorId,
        imageUrl: clubDataTyped.imageUrl,
        backgroundImageUrl: clubDataTyped.backgroundImageUrl,
        memberCount: actualMemberCount,
        isPrivate: clubDataTyped.isPrivate,
        created_at: clubDataTyped.created_at,
        updatedAt: clubDataTyped.updatedAt,
        isMember: clubDataTyped.is_member || false,
        userMembership,
        membersList,
        adminCount
      };

      setClub(enrichedClub);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load club');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubDataCallback = useCallback(fetchClubData, [clubId]);

  useEffect(() => {
    fetchClubDataCallback();
  }, [fetchClubDataCallback]);

  const joinClub = async () => {
    if (!session?.user?.id || !clubId) return { error: 'Unauthorized' };

    setActionLoading(true);
    try {
      const { error } = await clubApi.join(clubId);
      if (error) throw new Error(error);
      
      await fetchClubData(); // Refresh data
      return { success: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to join club' };
    } finally {
      setActionLoading(false);
    }
  };

  const leaveClub = async () => {
    if (!session?.user?.id || !clubId) return { error: 'Unauthorized' };

    setActionLoading(true);
    try {
      const { error } = await clubApi.leave(clubId);
      if (error) throw new Error(error);
      
      await fetchClubData(); // Refresh data
      return { success: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to leave club' };
    } finally {
      setActionLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member') => {
    if (!session?.user?.id || !clubId) return { error: 'Unauthorized' };
    
    // Check if current user is admin
    if (!club?.userMembership || club.userMembership.role !== 'admin') {
      return { error: 'Only admins can update member roles' };
    }

    setActionLoading(true);
    try {
      const { error } = await clubApi.updateMemberRole(clubId, memberId, role);
      if (error) throw new Error(error);
      
      await fetchClubData(); // Refresh data
      return { success: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update member role' };
    } finally {
      setActionLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!session?.user?.id || !clubId) return { error: 'Unauthorized' };
    
    // Check if current user is admin or removing themselves
    if (!club?.userMembership || 
        (club.userMembership.role !== 'admin' && club.userMembership.userId !== memberId)) {
      return { error: 'Only admins can remove other members' };
    }

    setActionLoading(true);
    try {
      const { error } = await clubApi.removeMember(clubId, memberId);
      if (error) throw new Error(error);
      
      await fetchClubData(); // Refresh data
      return { success: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to remove member' };
    } finally {
      setActionLoading(false);
    }
  };

  const getClubStatus = () => {
    if (!club) return 'unknown';
    return club.isPrivate ? 'private' : 'public';
  };

  const canManageMembers = () => {
    return club?.userMembership?.role === 'admin';
  };

  const canEditClub = () => {
    return club?.userMembership?.role === 'admin' || club?.creatorId === session?.user?.id;
  };

  return {
    club,
    loading,
    error,
    actionLoading,
    joinClub,
    leaveClub,
    updateMemberRole,
    removeMember,
    getClubStatus,
    canManageMembers,
    canEditClub,
    refresh: fetchClubData
  };
} 