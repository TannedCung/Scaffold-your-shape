import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: activityId } = await params;
    const { shareType, platform } = await request.json();

    if (!shareType || !['internal', 'external'].includes(shareType)) {
      return NextResponse.json({ error: 'Invalid share type' }, { status: 400 });
    }

    if (shareType === 'external' && !platform) {
      return NextResponse.json({ error: 'Platform required for external shares' }, { status: 400 });
    }

    // Verify activity exists and get details
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select(`
        id,
        name,
        type,
        value,
        unit,
        user_id,
        profiles(id, name)
      `)
      .eq('id', activityId)
      .single();

    if (activityError || !activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Record the share
    const { error: shareError } = await supabase
      .from('activity_shares')
      .insert({
        activity_id: activityId,
        user_id: session.user.id,
        share_type: shareType,
        platform: shareType === 'external' ? platform : null
      });

    if (shareError) {
      return NextResponse.json({ error: shareError.message }, { status: 500 });
    }

    // Generate share content
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3006';
    const shareUrl = `${baseUrl}/activities/${activityId}`;
    
    const profile = activity.profiles as { name?: string; avatar_url?: string } | null;
    const shareText = `Check out ${profile?.name || 'Someone'}'s ${activity.type}: ${activity.name} - ${activity.value} ${activity.unit}! 💪`;

    let externalShareUrl = '';
    
    if (shareType === 'external') {
      const encodedText = encodeURIComponent(shareText);
      const encodedUrl = encodeURIComponent(shareUrl);
      
      switch (platform) {
        case 'twitter':
          externalShareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
          break;
        case 'facebook':
          externalShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          break;
        case 'linkedin':
          externalShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
          break;
        case 'whatsapp':
          externalShareUrl = `https://wa.me/?text=${encodedText} ${encodedUrl}`;
          break;
        case 'telegram':
          externalShareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
          break;
        case 'copy':
          // For copy to clipboard, just return the URL
          break;
        default:
          return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
      }
    }

    return NextResponse.json({
      shareUrl,
      shareText,
      externalShareUrl: externalShareUrl || undefined,
      activity: {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        value: activity.value,
        unit: activity.unit,
        author: profile?.name || 'Unknown User'
      }
    });

  } catch (error) {
    console.error('Error sharing activity:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: activityId } = await params;

    // Get share count for this activity
    const { count, error } = await supabase
      .from('activity_shares')
      .select('*', { count: 'exact', head: true })
      .eq('activity_id', activityId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      shareCount: count || 0
    });

  } catch (error) {
    console.error('Error fetching share count:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 

