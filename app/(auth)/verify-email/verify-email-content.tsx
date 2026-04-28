'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [timer, setTimer] = useState(60);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResendEmail = async () => {
    try {
      const response = await fetch('/api/auth/resend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendStatus('success');
        setStatusMessage('Verification email resent. Check your inbox and spam folder.');
        setTimer(60);
      } else {
        const error = await response.json();
        setResendStatus('error');
        setStatusMessage(error.error || 'Failed to resend email');
      }
    } catch (error) {
      setResendStatus('error');
      setStatusMessage('Error resending email');
      console.error('Error resending email:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Envelope Icon */}
        <div className="mb-6">
          <div className="inline-block p-4 bg-teal-100 rounded-full">
            <svg
              className="w-12 h-12 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Check your email
        </h1>

        {/* Message */}
        <p className="text-slate-600 mb-2">
          We've sent a confirmation link to:
        </p>
        <p className="text-lg font-semibold text-teal-600 mb-6 break-all">
          {email}
        </p>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-slate-700">
            📧 <strong>Check your inbox</strong> for a confirmation email from Supabase
          </p>
          <p className="text-sm text-slate-700 mt-2">
            🔗 Click the <strong>confirmation link</strong> in the email to activate your account
          </p>
          <p className="text-sm text-slate-700 mt-2">
            🔄 After confirming, return and log in
          </p>
        </div>

        {statusMessage && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${resendStatus === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {statusMessage}
          </div>
        )}

        {/* Spam Warning */}
        <p className="text-xs text-slate-500 mb-6">
          💡 Don't see the email? Check your spam or junk folder
        </p>

        {/* Resend Button */}
        <button
          onClick={handleResendEmail}
          disabled={timer > 0}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors mb-4 ${
            timer > 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {timer > 0 ? `Resend in ${timer}s` : 'Resend confirmation email'}
        </button>

        {/* Back to Login */}
        <button
          onClick={() => router.push('/login')}
          className="w-full py-2 px-4 rounded-lg font-semibold text-teal-600 hover:bg-teal-50 transition-colors"
        >
          Back to Login
        </button>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-3">Need help?</p>
          <a
            href="#"
            className="text-sm text-teal-600 hover:underline"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
