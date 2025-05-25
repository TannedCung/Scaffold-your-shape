import { NextRequest, NextResponse } from 'next/server';
import { disconnectProfileFromStrava } from '@/services/stravaService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Disconnect the profile from Strava
    const cookie = request.headers.get('cookie');
    if (!cookie) {
      return NextResponse.json(
        { success: false, error: 'No cookie provided' },
        { status: 400 }
      );
    }
    
    const result = await disconnectProfileFromStrava(cookie);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      console.error('Error disconnecting from Strava:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to disconnect from Strava' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in Strava disconnect:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
} 