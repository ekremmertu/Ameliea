'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: string;
}

interface Purchase {
  id: string;
  plan_type: string;
  status: string;
  amount: number;
  currency: string;
  purchased_at: string;
  expires_at?: string;
}

export default function ProfilePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setPurchases(data.purchases);
      setName(data.profile.name);
      setPhone(data.profile.phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setSuccess(t('profile.updateSuccess', 'Profile updated successfully!'));
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('profile.notFound', 'Profile not found')}</p>
          <Link href="/login" className="text-rose-600 hover:text-rose-700">
            {t('profile.backToLogin', 'Back to Login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-rose-600 hover:text-rose-700 mb-4 inline-block">
            ← {t('profile.backToDashboard', 'Back to Dashboard')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('profile.title', 'My Profile')}
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('profile.personalInfo', 'Personal Information')}
            </h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                {t('profile.edit', 'Edit')}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.email', 'Email')}
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.name', 'Name')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.phone', 'Phone')}
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {editing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {saving ? t('profile.saving', 'Saving...') : t('profile.save', 'Save Changes')}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setName(profile.name);
                    setPhone(profile.phone);
                    setError('');
                    setSuccess('');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('profile.cancel', 'Cancel')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Purchases */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('profile.purchases', 'My Purchases')}
          </h2>
          {purchases.length === 0 ? (
            <p className="text-gray-600">{t('profile.noPurchases', 'No purchases yet')}</p>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {purchase.plan_type === 'light' ? 'Light Plan' : 'Premium Plan'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(purchase.purchased_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {purchase.amount} {purchase.currency}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                        purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('profile.actions', 'Account Actions')}
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              {t('profile.signOut', 'Sign Out')}
            </button>
            <Link
              href="/forgot-password"
              className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              {t('profile.changePassword', 'Change Password')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
