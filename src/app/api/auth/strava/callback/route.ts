import { NextRequest, NextResponse } from 'next/server';
import { connectProfileToStrava } from '@/services/stravaService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Check for errors
    if (error) {
      console.error('Strava authorization error:', error);
      return NextResponse.redirect(new URL('/profile?strava_error=access_denied', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/profile?strava_error=no_code', request.url));
    }

    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/sign-in?callbackUrl=/profile', request.url));
    }
    // Connect the profile to Strava
    const cookie = request.headers.get('cookie');
    if (!cookie) {
      return NextResponse.redirect(new URL('/profile?strava_error=no_cookie', request.url));
    }

    const result = await connectProfileToStrava(cookie, code);
    
    if (result.success) {
      return NextResponse.redirect(new URL('/profile?strava_connected=true', request.url));
    } else {
      console.error('Error connecting to Strava:', result.error);
      return NextResponse.redirect(new URL('/profile?strava_error=connection_failed', request.url));
    }
  } catch (error) {
    console.error('Error in Strava callback:', error);
    return NextResponse.redirect(new URL('/profile?strava_error=server_error', request.url));
  }
} 