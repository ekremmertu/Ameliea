'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';

interface MusicPlayerProps {
  musicUrl?: string;
  autoPlay?: boolean;
  themeColor?: string;
}

export function MusicPlayer({ musicUrl, autoPlay = false, themeColor }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isVisible, setIsVisible] = useState(false); // Hidden by default
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Handle play/pause when isPlaying changes
  useEffect(() => {
    if (audioRef.current && hasInteracted.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.debug('Error playing audio:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Wait for user interaction before autoplay
  useEffect(() => {
    if (!autoPlay || hasInteracted.current) return;

    const handleFirstInteraction = async () => {
      if (audioRef.current && !hasInteracted.current) {
        hasInteracted.current = true;
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          // Autoplay was prevented - this is normal
          console.debug('Autoplay prevented - waiting for user interaction');
        }
      }
    };

    // Listen for any user interaction
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    events.forEach((event) => {
      document.addEventListener(event, handleFirstInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [autoPlay]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!musicUrl) {
    return null;
  }

  // Handle audio load errors silently
  useEffect(() => {
    if (audioRef.current) {
      const handleError = () => {
        // Silently handle missing audio files - don't show errors in console
        if (audioRef.current) {
          audioRef.current.style.display = 'none';
        }
      };
      
      audioRef.current.addEventListener('error', handleError);
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, []);

  // Hidden player - just audio, no UI
  // Note: autoPlay attribute removed to comply with browser autoplay policies
  return (
    <>
      <audio 
        ref={audioRef} 
        loop 
        preload="none"
        onError={(e) => {
          // Silently handle missing audio files
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src={musicUrl} type="audio/mpeg" />
        <source src={musicUrl} type="audio/mp3" />
      </audio>
    </>
  );

  // Old visible player code (commented out)
  /*
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-full shadow-lg backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: `2px solid ${themeColor || tokens.colors.crimson.base}`,
            }}
          >
            <audio ref={audioRef} loop>
              <source src={musicUrl} type="audio/mpeg" />
              <source src={musicUrl} type="audio/mp3" />
            </audio>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                backgroundColor: themeColor || tokens.colors.crimson.base,
                color: 'white',
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                color: themeColor || tokens.colors.crimson.base,
              }}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1"
              style={{
                accentColor: themeColor || tokens.colors.crimson.base,
              }}
            />

            <button
              onClick={() => setIsVisible(false)}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                color: tokens.colors.text.muted,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  */
}

