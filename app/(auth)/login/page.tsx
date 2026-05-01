'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/auth-context';

const VETERINARY_SLIDES = [
  'https://images.pexels.com/photos/6235233/pexels-photo-6235233.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/6234600/pexels-photo-6234600.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/7474852/pexels-photo-7474852.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/7474856/pexels-photo-7474856.jpeg?auto=compress&cs=tinysrgb&w=1920',
];

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % VETERINARY_SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {VETERINARY_SLIDES.map((slide, index) => (
        <div
          key={slide}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${slide})` }}
        />
      ))}

      <div className="absolute inset-0 bg-slate-900/50" />

      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded-full bg-white/85 p-2 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <span className="text-xs font-medium text-slate-700">
          {currentSlide + 1}/{VETERINARY_SLIDES.length}
        </span>
      </div>

      <div className="relative z-10 w-full max-w-sm bg-white/95 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back!</h2>
          <p className="text-slate-600 text-sm">Sign in to check on your furry family 🐶 🐱</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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

          {/* Keep Signed In */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-slate-700 cursor-pointer">
              Keep me signed in
            </label>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In to PawHeleryCare'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            New to PawHeleryCare?{' '}
            <Link href="/signup" className="text-teal-600 hover:text-teal-700 font-medium">
              Create an account
            </Link>
          </p>
        </div>

        {/* Admin Login */}
        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-slate-600 text-sm mb-3">Are you an administrator?</p>
          <Link
            href="/admin-login"
            className="w-full flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            <span>👨‍💼</span>
            Go to Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
