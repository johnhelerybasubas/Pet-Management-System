'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function SeedDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSeed = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      const response = await fetch('/api/admin/seed-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully seeded database! Users: ${data.stats?.usersCreated || 0}, Pets: ${data.stats?.petsCreated || 0}, Services: ${data.stats?.servicesCreated || 0}`,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to seed data',
        });
      }
      
      setShowResult(true);
      setTimeout(() => setShowResult(false), 5000);
      
      // Refresh stats after seeding
      window.location.reload();
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to seed data',
      });
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleSeed}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-400 transition-colors text-sm"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Seeding Data...
          </>
        ) : (
          'Populate with Sample Data'
        )}
      </button>

      {showResult && result && (
        <div className={`flex items-start gap-3 p-3 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.message}
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500 italic">
        Use this to populate the database with sample data for testing
      </p>
    </div>
  );
}
