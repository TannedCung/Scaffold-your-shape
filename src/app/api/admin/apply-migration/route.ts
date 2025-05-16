import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  // Ensure this is an admin request with proper authorization
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is an admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Get migration file name from request
    const { migrationFile } = await request.json();
    
    if (!migrationFile) {
      return NextResponse.json({ error: 'Missing migration file' }, { status: 400 });
    }

    // Build the path to the migration file
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const migrationPath = path.join(migrationsDir, migrationFile);

    // Validate the path is within the migrations directory (security check)
    if (!migrationPath.startsWith(migrationsDir)) {
      return NextResponse.json({ error: 'Invalid migration path' }, { status: 400 });
    }

    // Check if file exists
    if (!fs.existsSync(migrationPath)) {
      return NextResponse.json({ error: 'Migration file not found' }, { status: 404 });
    }

    // Read the SQL content
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute the SQL using the RPC function
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Error executing migration:', error);
      return NextResponse.json({ error: 'Failed to execute migration', details: error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Migration ${migrationFile} applied successfully`,
      result: data
    });
  } catch (error) {
    console.error('Error applying migration:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  // Ensure this is an admin request with proper authorization
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is an admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Get migration file name from request
    const { migrationFile } = await request.json();
    
    if (!migrationFile) {
      return NextResponse.json({ error: 'Missing migration file' }, { status: 400 });
    }

    // Build the path to the migration file
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const migrationPath = path.join(migrationsDir, migrationFile);

    // Validate the path is within the migrations directory (security check)
    if (!migrationPath.startsWith(migrationsDir)) {
      return NextResponse.json({ error: 'Invalid migration path' }, { status: 400 });
    }

    // Check if file exists
    if (!fs.existsSync(migrationPath)) {
      return NextResponse.json({ error: 'Migration file not found' }, { status: 404 });
    }

    // Read the SQL content
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute the SQL using the RPC function
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Error executing migration:', error);
      return NextResponse.json({ error: 'Failed to execute migration', details: error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Migration ${migrationFile} applied successfully`,
      result: data
    });
  } catch (error) {
    console.error('Error applying migration:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 