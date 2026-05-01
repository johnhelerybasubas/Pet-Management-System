import Navigation from '@/app/components/Navigation';
import MusicPlayer from '@/app/components/MusicPlayer';
import { PetProvider } from '@/app/lib/pet-context';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PetProvider>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 ml-64 min-h-screen bg-slate-50 relative">
          <div className="fixed top-6 right-6 z-40">
            <MusicPlayer />
          </div>
          {children}
        </main>
      </div>
    </PetProvider>
  );
}
