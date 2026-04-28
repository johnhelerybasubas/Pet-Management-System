'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/auth-context';

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password);
      // Redirect to verification email page
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">🐾</span>
            <h1 className="text-2xl font-bold text-slate-900">PawHeleryCare</h1>
          </div>
          <p className="text-sm text-slate-600">Pet Management System</p>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-600 text-sm">Join PawHeleryCare and start managing your pets today 🐶 🐱</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-400"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-900 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-400"
            />
          </div>

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-slate-700 cursor-pointer">
              I agree to the{' '}
              <Link href="#" className="text-teal-600 hover:text-teal-700 font-medium">
                Terms of Service
              </Link>
            </label>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-600">or</span>
          </div>
        </div>

        {/* Google Sign Up */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          <span>🔍</span>
          Sign up with Google
        </button>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
