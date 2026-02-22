'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmojiPickerProps {
  currentEmoji: string;
  onSelect: (emoji: string) => void;
  themeColor?: string;
}

const EMOJI_LIST = [
  '⛪', '🍷', '🍽️', '🎵', '💝', '🎉', '🍾', '💐', '🎊', '🎈', 
  '🎁', '💍', '🌹', '✨', '🎭', '🎪', '⏰', '💒', '🎨', '🎬',
  '🎤', '🎸', '🎹', '🥂', '🍰', '🌺', '🌸', '🌻', '🌷', '🌼'
];

export function EmojiPicker({ currentEmoji, onSelect, themeColor = '#c8a24a' }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl transition-all hover:scale-110"
        style={{
          backgroundColor: 'var(--bg-panel-strong)',
          borderColor: isOpen ? themeColor : 'var(--border-base)',
          minHeight: '44px',
        }}
        title="Emoji seç"
      >
        {currentEmoji || '⏰'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Picker Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 p-6 rounded-xl border-2 z-50"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                borderColor: themeColor,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                minWidth: '320px',
                maxWidth: '400px',
              }}
            >
              <div className="grid grid-cols-8 gap-3 max-h-80 overflow-y-auto pr-2">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelect(emoji)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-125 ${
                      currentEmoji === emoji ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: currentEmoji === emoji 
                        ? `${themeColor}26` 
                        : 'var(--bg-panel)',
                      // ringColor: themeColor, // Not a valid CSS property, using border instead
                      borderColor: themeColor,
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

