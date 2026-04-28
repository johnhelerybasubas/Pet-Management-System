'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getCachedSession } from '@/app/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

const CARTOON_AVATARS = [
  '/avatars/cartoon-1.svg',
  '/avatars/cartoon-2.svg',
  '/avatars/cartoon-3.svg',
  '/avatars/cartoon-4.svg',
  '/avatars/cartoon-5.svg',
  '/avatars/cartoon-6.svg',
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const session = await getCachedSession();
        if (!session?.access_token) {
          setError('You need to log in to view your profile.');
          return;
        }

        const response = await fetch('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to load profile');
        }

        const data = await response.json();
        setProfile(data.profile);
        setFullName(data.profile.full_name || '');
        setAvatarUrl(data.profile.avatar_url || '');
        setPhoneNumber(data.profile.phone_number || '');
        setAddress(data.profile.address || '');
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const selectedAvatar = useMemo(() => avatarUrl || '', [avatarUrl]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const session = await getCachedSession();
      if (!session?.access_token) {
        throw new Error('You need to log in to update your profile.');
      }

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          avatar_url: avatarUrl.trim(),
          phone_number: phoneNumber.trim(),
          address: address.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              full_name: data.profile.full_name || fullName,
              avatar_url: data.profile.avatar_url || avatarUrl,
              phone_number: data.profile.phone_number || phoneNumber,
              address: data.profile.address || address,
            }
          : current,
      );

      setSuccessMessage('Profile saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-slate-600">Update your account info and choose a cartoon avatar.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
          {successMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
              {successMessage}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
            <div className="space-y-3">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                {selectedAvatar ? (
                  <Image
                    src={selectedAvatar}
                    alt={fullName || 'Profile avatar'}
                    width={128}
                    height={128}
                    className="h-32 w-32 object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-teal-600 text-4xl font-bold text-white">
                    {fullName?.slice(0, 1).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Current avatar</p>
                <p className="text-sm text-slate-500">Choose a cartoon style below</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="avatar-url" className="mb-1 block text-sm font-medium text-slate-700">
                  Update profile picture <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  id="avatar-url"
                  type="text"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="Optional: paste a custom image URL"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Choose a cartoon avatar</p>
                <p className="mb-3 text-xs text-slate-500">Click any avatar below to select it</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {CARTOON_AVATARS.map((avatar) => {
                    const isSelected = avatarUrl === avatar;
                    return (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setAvatarUrl(avatar)}
                        className={`overflow-hidden rounded-2xl border-2 p-1 transition ${
                          isSelected ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-300'
                        }`}
                        title="Select cartoon avatar"
                      >
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                          <Image src={avatar} alt="Cartoon avatar option" width={64} height={64} className="h-16 w-16 object-cover" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="full-name" className="mb-1 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={profile?.email || ''}
                readOnly
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-600"
              />
            </div>

            <div>
              <label htmlFor="phone-number" className="mb-1 block text-sm font-medium text-slate-700">
                Phone number
              </label>
              <input
                id="phone-number"
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="Enter your phone number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>

            <div>
              <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Enter your address"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Common settings for user and admin profiles can be updated here. Profile picture, name, email, phone number, and address are saved per account.
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
