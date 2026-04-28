'use client';

import { useEffect, useRef, useState } from 'react';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/The Animal Sounds Song.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Error playing audio:', err);
      });
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={toggleMusic}
      className="p-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-lg hover:shadow-xl"
      title={isPlaying ? 'Mute music' : 'Play music'}
      aria-label={isPlaying ? 'Mute music' : 'Play music'}
    >
      {isPlaying ? (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zm4 0a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
      )}
    </button>
  );
}
