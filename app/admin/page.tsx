/**
 * Admin Dashboard Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Analytics {
  summary: {
    totalInvitations: number;
    publishedInvitations: number;
    totalRsvps: number;
    attendingRsvps: number;
    totalPurchases: number;
    completedPurchases: number;
    totalRevenue: number;
    totalTestimonials: number;
    approvedTestimonials: number;
  };
  planDistribution: Record<string, number>;
  dailyStats: Array<{
    date: string;
    invitations: number;
    rsvps: number;
    purchases: number;
    revenue: number;
  }>;
}

interface PendingTestimonial {
  id: string;
  name: string;
  message: string;
  created_at: string;
  invitations: {
    slug: string;
    bride_name: string;
    groom_name: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pendingTestimonials, setPendingTestimonials] = useState<PendingTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTestimonials, setSelectedTestimonials] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, testimonialsRes] = await Promise.all([
        fetch('/api/admin/analytics?days=30'),
        fetch('/api/admin/testimonials/moderate'),
      ]);

      if (analyticsRes.status === 403 || testimonialsRes.status === 403) {
        router.push('/');
        return;
      }

      if (!analyticsRes.ok || !testimonialsRes.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const analyticsData = await analyticsRes.json();
      const testimonialsData = await testimonialsRes.json();

      setAnalytics(analyticsData);
      setPendingTestimonials(testimonialsData.testimonials || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const moderateTestimonials = async (action: 'approve' | 'reject') => {
    if (selectedTestimonials.size === 0) return;

    try {
      const res = await fetch('/api/admin/testimonials/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testimonialIds: Array.from(selectedTestimonials),
          action,
        }),
      });

      if (!res.ok) throw new Error('Moderation failed');

      setSelectedTestimonials(new Set());
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Moderation failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gold text-white rounded hover:bg-gold-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-ink">Admin Dashboard</h1>

        {/* Summary Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-text-secondary mb-2">Total Invitations</h3>
              <p className="text-3xl font-bold text-ink">{analytics.summary.totalInvitations}</p>
              <p className="text-sm text-text-muted mt-1">
                {analytics.summary.publishedInvitations} published
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-text-secondary mb-2">Total RSVPs</h3>
              <p className="text-3xl font-bold text-ink">{analytics.summary.totalRsvps}</p>
              <p className="text-sm text-text-muted mt-1">
                {analytics.summary.attendingRsvps} attending
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-text-secondary mb-2">Revenue</h3>
              <p className="text-3xl font-bold text-crimson">
                ₺{analytics.summary.totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-text-muted mt-1">
                {analytics.summary.completedPurchases} purchases
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-text-secondary mb-2">Testimonials</h3>
              <p className="text-3xl font-bold text-ink">{analytics.summary.totalTestimonials}</p>
              <p className="text-sm text-text-muted mt-1">
                {pendingTestimonials.length} pending
              </p>
            </div>
          </div>
        )}

        {/* Pending Testimonials */}
        {pendingTestimonials.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-ink">Pending Testimonials</h2>
              <div className="space-x-2">
                <button
                  onClick={() => moderateTestimonials('approve')}
                  disabled={selectedTestimonials.size === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Approve ({selectedTestimonials.size})
                </button>
                <button
                  onClick={() => moderateTestimonials('reject')}
                  disabled={selectedTestimonials.size === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Reject ({selectedTestimonials.size})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {pendingTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="border rounded p-4 flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedTestimonials.has(testimonial.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedTestimonials);
                      if (e.target.checked) {
                        newSet.add(testimonial.id);
                      } else {
                        newSet.delete(testimonial.id);
                      }
                      setSelectedTestimonials(newSet);
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-text-secondary">
                          For: {testimonial.invitations.bride_name} & {testimonial.invitations.groom_name}
                        </p>
                      </div>
                      <p className="text-sm text-text-muted">
                        {new Date(testimonial.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-text-primary">{testimonial.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-ink mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="p-4 border rounded hover:bg-gray-50 text-left"
            >
              <h3 className="font-semibold mb-1">Manage Users</h3>
              <p className="text-sm text-text-secondary">View and manage user accounts</p>
            </button>
            <button
              onClick={() => router.push('/admin/invitations')}
              className="p-4 border rounded hover:bg-gray-50 text-left"
            >
              <h3 className="font-semibold mb-1">View Invitations</h3>
              <p className="text-sm text-text-secondary">Browse all invitations</p>
            </button>
            <button
              onClick={() => router.push('/admin/payments')}
              className="p-4 border rounded hover:bg-gray-50 text-left"
            >
              <h3 className="font-semibold mb-1">Payment History</h3>
              <p className="text-sm text-text-secondary">View all transactions</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
