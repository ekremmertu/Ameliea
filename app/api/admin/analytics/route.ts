/**
 * Admin API: Analytics Dashboard
 * GET /api/admin/analytics - Get platform analytics
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
      logger.warn('Unauthorized admin analytics access', { userId: user.id });
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Get date range from query params
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Parallel queries for analytics
    const [
      invitationsResult,
      rsvpsResult,
      purchasesResult,
      testimonialsResult,
    ] = await Promise.all([
      // Total invitations
      supabase
        .from('invitations')
        .select('id, created_at, is_published', { count: 'exact' })
        .gte('created_at', startDate.toISOString()),
      
      // Total RSVPs
      supabase
        .from('rsvps')
        .select('id, created_at, attendance', { count: 'exact' })
        .gte('created_at', startDate.toISOString()),
      
      // Total purchases
      supabase
        .from('purchases')
        .select('id, created_at, status, plan_type, amount', { count: 'exact' })
        .gte('created_at', startDate.toISOString()),
      
      // Total testimonials
      supabase
        .from('testimonials')
        .select('id, created_at, approved', { count: 'exact' })
        .gte('created_at', startDate.toISOString()),
    ]);
    
    if (invitationsResult.error) throw invitationsResult.error;
    if (rsvpsResult.error) throw rsvpsResult.error;
    if (purchasesResult.error) throw purchasesResult.error;
    if (testimonialsResult.error) throw testimonialsResult.error;
    
    // Calculate metrics
    const publishedInvitations = invitationsResult.data?.filter(i => i.is_published).length || 0;
    const attendingRsvps = rsvpsResult.data?.filter(r => r.attendance === 'yes').length || 0;
    const completedPurchases = purchasesResult.data?.filter(p => p.status === 'completed').length || 0;
    const approvedTestimonials = testimonialsResult.data?.filter(t => t.approved).length || 0;
    
    // Calculate revenue
    const totalRevenue = purchasesResult.data
      ?.filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    
    // Plan distribution
    const planDistribution = purchasesResult.data
      ?.filter(p => p.status === 'completed')
      .reduce((acc, p) => {
        acc[p.plan_type] = (acc[p.plan_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
    
    // Daily breakdown
    const dailyStats = new Map<string, {
      invitations: number;
      rsvps: number;
      purchases: number;
      revenue: number;
    }>();
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyStats.set(dateKey, { invitations: 0, rsvps: 0, purchases: 0, revenue: 0 });
    }
    
    invitationsResult.data?.forEach(inv => {
      const dateKey = inv.created_at.split('T')[0];
      const stats = dailyStats.get(dateKey);
      if (stats) stats.invitations++;
    });
    
    rsvpsResult.data?.forEach(rsvp => {
      const dateKey = rsvp.created_at.split('T')[0];
      const stats = dailyStats.get(dateKey);
      if (stats) stats.rsvps++;
    });
    
    purchasesResult.data?.forEach(purchase => {
      const dateKey = purchase.created_at.split('T')[0];
      const stats = dailyStats.get(dateKey);
      if (stats && purchase.status === 'completed') {
        stats.purchases++;
        stats.revenue += purchase.amount || 0;
      }
    });
    
    const analytics = {
      summary: {
        totalInvitations: invitationsResult.count || 0,
        publishedInvitations,
        totalRsvps: rsvpsResult.count || 0,
        attendingRsvps,
        totalPurchases: purchasesResult.count || 0,
        completedPurchases,
        totalRevenue,
        totalTestimonials: testimonialsResult.count || 0,
        approvedTestimonials,
      },
      planDistribution,
      dailyStats: Array.from(dailyStats.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .reverse(),
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    };
    
    logger.info('Admin: Analytics viewed', { adminId: user.id, days });
    
    return NextResponse.json(analytics);
    
  } catch (error) {
    logger.apiError('GET', '/api/admin/analytics', error as Error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
