'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getCachedSession } from '@/app/lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

type ReminderPreference = 'all' | 'vaccines-checkups' | 'bookings-only' | 'off';

type ScheduleTime = 'Morning' | 'Midday' | 'Afternoon' | 'Evening';

interface UserSettings {
  defaultPetProfile: string;
  reminderPreference: ReminderPreference;
  preferredScheduleTimes: ScheduleTime[];
  savedServices: string[];
}

const SCHEDULE_TIME_OPTIONS: ScheduleTime[] = ['Morning', 'Midday', 'Afternoon', 'Evening'];
const SAVED_SERVICE_OPTIONS = ['grooming', 'boarding', 'checkup', 'vaccination records'];

const DEFAULT_SETTINGS: UserSettings = {
  defaultPetProfile: '',
  reminderPreference: 'vaccines-checkups',
  preferredScheduleTimes: ['Morning', 'Afternoon'],
  savedServices: ['checkup', 'vaccination records'],
};

const getSettingsStorageKey = (userId: string) => `user_settings:${userId}`;

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const session = await getCachedSession();
        if (!session?.access_token) {
          setError('You need to log in to change settings.');
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

        const storageKey = getSettingsStorageKey(data.profile.id);
        const storedSettings = localStorage.getItem(storageKey);

        if (storedSettings) {
          try {
            const parsedSettings = JSON.parse(storedSettings) as Partial<UserSettings>;
            setUserSettings({
              ...DEFAULT_SETTINGS,
              ...parsedSettings,
            });
          } catch {
            setUserSettings(DEFAULT_SETTINGS);
          }
        } else {
          setUserSettings(DEFAULT_SETTINGS);
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const toggleScheduleTime = (time: ScheduleTime) => {
    setUserSettings((current) => ({
      ...current,
      preferredScheduleTimes: current.preferredScheduleTimes.includes(time)
        ? current.preferredScheduleTimes.filter((item) => item !== time)
        : [...current.preferredScheduleTimes, time],
    }));
  };

  const toggleSavedService = (service: string) => {
    setUserSettings((current) => ({
      ...current,
      savedServices: current.savedServices.includes(service)
        ? current.savedServices.filter((item) => item !== service)
        : [...current.savedServices, service],
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const session = await getCachedSession();
      if (!session?.access_token) {
        throw new Error('You need to log in to change settings.');
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
          settings: userSettings,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      if (profile?.id) {
        localStorage.setItem(getSettingsStorageKey(profile.id), JSON.stringify(userSettings));
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              full_name: data.profile.full_name || fullName,
              avatar_url: data.profile.avatar_url || avatarUrl,
            }
          : current,
      );

      setSuccessMessage('Settings saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-slate-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600">Update your profile details.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
          {successMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
              {successMessage}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
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
            <label htmlFor="full-name" className="mb-1 block text-sm font-medium text-slate-700">
              Full Name
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
            <label htmlFor="avatar-url" className="mb-1 block text-sm font-medium text-slate-700">
              Avatar URL
            </label>
            <input
              id="avatar-url"
              type="url"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">User-Only Settings</h2>
              <p className="text-sm text-slate-600">These preferences are saved for your account only.</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Pet Preferences</h3>
                  <p className="text-sm text-slate-600">Choose your default pet view and reminder behavior.</p>
                </div>

                <div>
                  <label htmlFor="default-pet-profile" className="mb-1 block text-sm font-medium text-slate-700">
                    Default pet profile
                  </label>
                  <select
                    id="default-pet-profile"
                    value={userSettings.defaultPetProfile}
                    onChange={(event) =>
                      setUserSettings((current) => ({
                        ...current,
                        defaultPetProfile: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  >
                    <option value="">Choose a default pet profile</option>
                    <option value="last-viewed">Last viewed pet</option>
                    <option value="all-pets">All pets overview</option>
                    <option value="appointments-first">Appointments first</option>
                  </select>
                </div>

                <div>
                  <p className="mb-2 block text-sm font-medium text-slate-700">
                    Reminder preferences for pet vaccines/checkups
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      { value: 'all', label: 'All reminders' },
                      { value: 'vaccines-checkups', label: 'Vaccines and checkups only' },
                      { value: 'bookings-only', label: 'Booking reminders only' },
                      { value: 'off', label: 'Turn off reminders' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition ${
                          userSettings.reminderPreference === option.value
                            ? 'border-teal-500 bg-teal-50 text-teal-900'
                            : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reminderPreference"
                          value={option.value}
                          checked={userSettings.reminderPreference === option.value}
                          onChange={() =>
                            setUserSettings((current) => ({
                              ...current,
                              reminderPreference: option.value as ReminderPreference,
                            }))
                          }
                          className="h-4 w-4 accent-teal-600"
                        />
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Booking Preferences</h3>
                  <p className="text-sm text-slate-600">Keep your preferred time windows and favorite services ready.</p>
                </div>

                <div>
                  <p className="mb-2 text-sm text-slate-600">Preferred schedule times</p>
                  <div className="flex flex-wrap gap-2">
                    {SCHEDULE_TIME_OPTIONS.map((time) => {
                      const isSelected = userSettings.preferredScheduleTimes.includes(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => toggleScheduleTime(time)}
                          className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                            isSelected
                              ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : 'border-slate-300 bg-white text-slate-600 hover:border-teal-300'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-slate-600">Saved services</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SAVED_SERVICE_OPTIONS.map((service) => {
                      const isSelected = userSettings.savedServices.includes(service);
                      return (
                        <label
                          key={service}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition ${
                            isSelected
                              ? 'border-teal-500 bg-teal-50 text-teal-900'
                              : 'border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSavedService(service)}
                            className="h-4 w-4 accent-teal-600"
                          />
                          <span className="text-sm font-medium capitalize">{service}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
