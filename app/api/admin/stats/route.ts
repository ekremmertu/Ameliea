/**
 * Admin Statistics API Route
 * GET /api/admin/stats
 * Returns platform statistics (admin only)
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdminEmail(userData.user.email)) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Use service role for admin operations
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'SERVICE_ROLE_KEY_NOT_CONFIGURED' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Fetch platform statistics
    const { data: invitations } = await supabaseAdmin
      .from('invitations')
      .select('id, is_published, created_at');

    const { data: rsvps } = await supabaseAdmin
      .from('rsvps')
      .select('id');

    // Get user count (from auth.users)
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get token statistics
    const { data: allTokens } = await supabaseAdmin
      .from('invitation_guests')
      .select('status');

    const platformStats = {
      totalUsers: users?.length || 0,
      totalInvitations: invitations?.length || 0,
      totalRSVPs: rsvps?.length || 0,
      publishedInvitations: invitations?.filter(i => i.is_published).length || 0,
      activeUsers: users?.filter(u => {
        const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at) : null;
        return lastSignIn && lastSignIn >= thirtyDaysAgo;
      }).length || 0,
      newUsersLast30Days: users?.filter(u => {
        const createdAt = new Date(u.created_at);
        return createdAt >= thirtyDaysAgo;
      }).length || 0,
      newInvitationsLast30Days: invitations?.filter(i => {
        const createdAt = new Date(i.created_at);
        return createdAt >= thirtyDaysAgo;
      }).length || 0,
      totalTokensSent: allTokens?.length || 0,
      totalTokensOpened: allTokens?.filter(t => t.status === 'opened' || t.status === 'responded').length || 0,
      totalTokensResponded: allTokens?.filter(t => t.status === 'responded').length || 0,
    };

    // Fetch user statistics (first 50 users)
    const userStatsPromises = (users || []).slice(0, 50).map(async (u) => {
      const { data: userInvitations } = await supabaseAdmin
        .from('invitations')
        .select('id')
        .eq('owner_id', u.id);

      const invitationIds = userInvitations?.map(i => i.id) || [];
      
      const { data: userRsvps } = invitationIds.length > 0
        ? await supabaseAdmin
            .from('rsvps')
            .select('id')
            .in('invitation_id', invitationIds)
        : { data: null };

      // Fetch token metrics for user's invitations
      const { data: userTokens } = invitationIds.length > 0
        ? await supabaseAdmin
            .from('invitation_guests')
            .select('status')
            .in('invitation_id', invitationIds)
        : { data: null };

      const tokenMetrics = {
        totalSent: userTokens?.length || 0,
        totalOpened: userTokens?.filter(t => t.status === 'opened' || t.status === 'responded').length || 0,
        totalResponded: userTokens?.filter(t => t.status === 'responded').length || 0,
      };

      return {
        id: u.id,
        email: u.email || 'N/A',
        created_at: u.created_at,
        invitations_count: userInvitations?.length || 0,
        rsvps_count: userRsvps?.length || 0,
        token_metrics: tokenMetrics,
      };
    });

    const userStats = await Promise.all(userStatsPromises);

    // Fetch invitation statistics (last 50)
    const { data: allInvitations } = await supabaseAdmin
      .from('invitations')
      .select('id, slug, title, owner_id, created_at, is_published')
      .order('created_at', { ascending: false })
      .limit(50);

    const invitationStatsPromises = (allInvitations || []).map(async (inv) => {
      // Get owner email
      const { data: ownerData } = await supabaseAdmin.auth.admin.getUserById(inv.owner_id);
      
      // Get RSVP count
      const { data: rsvps } = await supabaseAdmin
        .from('rsvps')
        .select('id')
        .eq('invitation_id', inv.id);

      return {
        id: inv.id,
        slug: inv.slug,
        title: inv.title,
        owner_email: ownerData?.user?.email || 'N/A',
        created_at: inv.created_at,
        is_published: inv.is_published,
        rsvps_count: rsvps?.length || 0,
      };
    });

    const invitationStats = await Promise.all(invitationStatsPromises);

    return NextResponse.json({
      platformStats,
      userStats,
      invitationStats,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in admin stats API:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

