/**
 * Theme Selector Component
 * Allows users to select and preview themes
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeId, THEMES, getAllThemes, type ThemeConfig } from '@/lib/themes';
import { tokens } from '@/lib/design-tokens';
import { ThemeIntro } from '@/components/themes/ThemeIntro';

interface ThemeSelectorProps {
  selectedThemeId: ThemeId;
  onThemeSelect: (themeId: ThemeId) => void;
  lang?: 'tr' | 'en';
  showPreview?: boolean;
}

export function ThemeSelector({ 
  selectedThemeId, 
  onThemeSelect, 
  lang = 'tr',
  showPreview = false,
}: ThemeSelectorProps) {
  const themes = getAllThemes();
  const selectedTheme = THEMES[selectedThemeId];

  return (
    <div className="space-y-6">
      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {themes.map((theme) => {
          const isSelected = theme.id === selectedThemeId;
          return (
            <motion.button
              key={theme.id}
              type="button"
              onClick={() => onThemeSelect(theme.id)}
              className="relative p-4 rounded-xl border-2 transition-all min-h-[120px] overflow-hidden"
              style={{
                borderColor: isSelected ? theme.colors.primary : 'var(--border-base)',
                backgroundColor: isSelected ? `${theme.colors.primary}15` : 'var(--bg-panel)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Color Preview */}
              <div className="flex gap-2 justify-center mb-3">
                <div
                  className="w-8 h-8 rounded-full border-2"
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderColor: 'var(--border-base)',
                  }}
                />
                <div
                  className="w-8 h-8 rounded-full border-2"
                  style={{
                    backgroundColor: theme.colors.secondary,
                    borderColor: 'var(--border-base)',
                  }}
                />
                <div
                  className="w-8 h-8 rounded-full border-2"
                  style={{
                    backgroundColor: theme.colors.accent,
                    borderColor: 'var(--border-base)',
                  }}
                />
              </div>

              {/* Theme Name */}
              <div className="text-center">
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: isSelected ? theme.colors.primary : tokens.colors.text.primary,
                  }}
                >
                  {theme.name[lang]}
                </p>
                {isSelected && (
                  <motion.div
                    className="absolute top-2 right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Theme Info */}
      {selectedTheme && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--bg-panel-strong)',
            border: `1px solid ${selectedTheme.colors.primary}40`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3
              className="text-lg font-semibold"
              style={{ color: tokens.colors.text.primary }}
            >
              {selectedTheme.name[lang]}
            </h3>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: `${selectedTheme.colors.primary}20`,
                color: selectedTheme.colors.primary,
              }}
            >
              {lang === 'tr' ? `${selectedTheme.animation.duration}s animasyon` : `${selectedTheme.animation.duration}s animation`}
            </span>
          </div>
          <p
            className="text-sm"
            style={{ color: tokens.colors.text.secondary }}
          >
            {lang === 'tr' 
              ? `${selectedTheme.layout.style === 'centered' ? 'Merkezi' : selectedTheme.layout.style === 'asymmetric' ? 'Asimetrik' : 'Dergi'} düzen, ${selectedTheme.layout.decorativeElements ? 'dekoratif elementler' : 'minimal tasarım'}`
              : `${selectedTheme.layout.style} layout, ${selectedTheme.layout.decorativeElements ? 'decorative elements' : 'minimal design'}`}
          </p>
        </motion.div>
      )}

      {/* Preview Button */}
      {showPreview && selectedTheme && (
        <ThemePreviewButton 
          themeId={selectedThemeId}
          themeColors={selectedTheme.colors}
        />
      )}
    </div>
  );
}

/**
 * Theme Preview Button
 * Shows a preview of the animation
 */
function ThemePreviewButton({ 
  themeId, 
  themeColors 
}: { 
  themeId: ThemeId; 
  themeColors: ThemeConfig['colors'];
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowPreview(true)}
        className="w-full px-4 py-3 rounded-xl border transition-all"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: themeColors.primary,
          color: themeColors.primary,
        }}
      >
        Önizleme Göster
      </button>

      {showPreview && (
        <ThemeIntro
          themeId={themeId}
          themeColors={themeColors}
          onComplete={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

