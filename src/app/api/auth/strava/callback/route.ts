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
    console.log('code', code);
    console.log('error', error);
    console.log('request', request);

    // Check for errors
    if (error) {
      console.error('Strava authorization error:', error);
      return NextResponse.redirect(new URL('/profile?strava_error=access_denied', process.env.NEXTAUTH_URL!));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/profile?strava_error=no_code', process.env.NEXTAUTH_URL!));
    }

    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/sign-in?callbackUrl=/profile', process.env.NEXTAUTH_URL!));
    }
    // Connect the profile to Strava
    const cookie = request.headers.get('cookie');
    if (!cookie) {
      return NextResponse.redirect(new URL('/profile?strava_error=no_cookie', process.env.NEXTAUTH_URL!));
    }

    const result = await connectProfileToStrava(cookie, code);
    
    if (result.success) {
      return NextResponse.redirect(new URL('/profile?strava_connected=true', process.env.NEXTAUTH_URL!));
    } else {
      console.error('Error connecting to Strava:', result.error);
      return NextResponse.redirect(new URL('/profile?strava_error=connection_failed', process.env.NEXTAUTH_URL!));
    }
  } catch (error) {
    console.error('Error in Strava callback:', error);
    return NextResponse.redirect(new URL('/profile?strava_error=server_error', process.env.NEXTAUTH_URL!));
  }
}