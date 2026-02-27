/**
 * Admin API: User Management
 * GET /api/admin/users - List all users
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/rbac';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check admin permission
    if (!isAdmin(user.email)) {
      logger.warn('Unauthorized admin access attempt', { userId: user.id, email: user.email });
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;
    
    // Get users with their invitation counts
    let query = supabase
      .from('invitations')
      .select('owner_id, created_at', { count: 'exact' });
    
    const { data: invitations, error: invError, count } = await query;
    
    if (invError) {
      logger.dbError('SELECT', 'invitations', invError);
      throw invError;
    }
    
    // Aggregate by user
    const userStats = new Map<string, { invitationCount: number; lastActivity: string }>();
    
    invitations?.forEach(inv => {
      const existing = userStats.get(inv.owner_id);
      if (!existing || new Date(inv.created_at) > new Date(existing.lastActivity)) {
        userStats.set(inv.owner_id, {
          invitationCount: (existing?.invitationCount || 0) + 1,
          lastActivity: inv.created_at,
        });
      }
    });
    
    // Get user details from auth
    const userIds = Array.from(userStats.keys()).slice(offset, offset + limit);
    const users = [];
    
    for (const userId of userIds) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        if (userData.user) {
          const stats = userStats.get(userId);
          users.push({
            id: userData.user.id,
            email: userData.user.email,
            created_at: userData.user.created_at,
            last_sign_in_at: userData.user.last_sign_in_at,
            invitation_count: stats?.invitationCount || 0,
            last_activity: stats?.lastActivity || userData.user.created_at,
          });
        }
      } catch (err) {
        logger.error('Failed to fetch user details', err as Error, { userId });
      }
    }
    
    logger.info('Admin: Users listed', { 
      adminId: user.id, 
      page, 
      limit, 
      totalUsers: userStats.size 
    });
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: userStats.size,
        totalPages: Math.ceil(userStats.size / limit),
      },
    });
    
  } catch (error) {
    logger.apiError('GET', '/api/admin/users', error as Error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
