'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [trustDevice, setTrustDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Login failed');
        } else {
          throw new Error('Server error. Please try again.');
        }
      }

      const data = await response.json();

      if (data.requires2FA) {
        setStep('2fa');
      } else {
        // Skip 2FA if not required, go directly to dashboard
        router.push('/admin/dashboard');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      alert(error instanceof Error ? error.message : 'Login failed');
      setIsLoading(false);
    }
  };

  const handleTwoFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const code = (e.target as HTMLFormElement).code.value;
      
      const response = await fetch('/api/auth/admin-verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, trustDevice }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '2FA verification failed');
      }

      // Redirect to admin dashboard after successful 2FA
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('2FA error:', error);
      alert(error instanceof Error ? error.message : '2FA verification failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Admin Portal Badge */}
        <div className="text-center mb-8">
          <div className="inline-block bg-emerald-700 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full mb-4">
            ADMIN PORTAL
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl">🐾</span>
              <h1 className="text-2xl font-bold text-white">PawHeleryCare</h1>
            </div>
            <p className="text-xs text-slate-400">Pet Management System</p>
          </div>

          {/* Warning Alert */}
          <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-3 mb-6">
            <p className="text-xs text-red-200">
              This portal is for PawHeleryCare administrations only. Unauthorized access attempts are logged and monitored.
            </p>
          </div>

          {step === 'credentials' ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-1 text-center">Admin Sign In</h2>
              <p className="text-slate-400 text-sm text-center mb-6">Restricted access — authorized personnel only.</p>

              {/* Credentials Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-300 mb-2 uppercase">
                    Credentials
                  </label>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-400 mb-1">
                    Admin Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-300 text-xs font-medium"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 text-white px-3 py-2 rounded font-semibold hover:bg-emerald-700 transition-colors disabled:bg-emerald-500 disabled:cursor-not-allowed text-sm mt-6"
                >
                  {isLoading ? 'Verifying...' : 'Verify Credentials'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-1 text-center">Two-Factor Authentication</h2>
              <p className="text-slate-400 text-sm text-center mb-6">Enter the code from your authenticator app.</p>

              {/* 2FA Form */}
              <form onSubmit={handleTwoFASubmit} className="space-y-4">
                {/* 2FA Code */}
                <div>
                  <label htmlFor="code" className="block text-xs font-semibold text-slate-400 mb-2">
                    TWO-FACTOR AUTHENTICATION
                  </label>
                  <label htmlFor="code" className="block text-xs font-semibold text-slate-400 mb-1">
                    Enter 6-digit code from your authenticator
                  </label>
                  <input
                    id="code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm tracking-widest"
                  />
                </div>

                {/* Trust Device Checkbox */}
                <div className="flex items-center">
                  <input
                    id="trust"
                    type="checkbox"
                    checked={trustDevice}
                    onChange={(e) => setTrustDevice(e.target.checked)}
                    className="h-4 w-4 bg-slate-700 border border-slate-600 rounded text-emerald-600 focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="trust" className="ml-2 block text-xs text-slate-400 cursor-pointer">
                    Trust this device
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 text-white px-3 py-2 rounded font-semibold hover:bg-emerald-700 transition-colors disabled:bg-emerald-500 disabled:cursor-not-allowed text-sm mt-6"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </form>

              {/* Back Button */}
              <button
                onClick={() => {
                  setStep('credentials');
                  setPassword('');
                }}
                className="w-full mt-3 text-slate-400 hover:text-slate-300 text-xs font-medium transition-colors"
              >
                ← Back to Login
              </button>
            </>
          )}

          {/* Footer Links */}
          {step === 'credentials' && (
            <div className="mt-6 pt-6 border-t border-slate-700 space-y-2 text-center text-xs">
              <Link href="/login" className="text-slate-400 hover:text-slate-300 block transition-colors">
                ← Back to user login
              </Link>
              <p className="text-slate-500">
                Systems operational{' '}
                <span className="text-emerald-400 font-semibold">✓</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
