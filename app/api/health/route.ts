/**
 * Health Check API Route
 * GET /api/health
 * Public endpoint for monitoring
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Check Supabase connection
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('invitations').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned, which is OK
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'error',
        error: error.message,
      }, { status: 503 });
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
