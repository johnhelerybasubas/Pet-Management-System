import { Suspense } from 'react';
import BookingAppointments from '@/app/components/BookingAppointments';

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingAppointments />
    </Suspense>
  );
}
