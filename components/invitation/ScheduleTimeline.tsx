'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface ScheduleItem {
  time: string;
  event: string;
  description: string;
  icon?: string;
}

interface ScheduleTimelineProps {
  scheduleItems: ScheduleItem[];
}

// Icon mapping for different event types
function getEventIcon(eventName: string): string {
  const name = eventName.toLowerCase();
  if (name.includes('ceremony') || name.includes('tören') || name.includes('ceremonia')) {
    return '⛪';
  } else if (name.includes('cocktail') || name.includes('kokteyl') || name.includes('cóctel')) {
    return '🍷';
  } else if (name.includes('dinner') || name.includes('banquet') || name.includes('yemek') || name.includes('banquete')) {
    return '🍽️';
  } else if (name.includes('party') || name.includes('fiesta') || name.includes('dans') || name.includes('eğlence')) {
    return '🎵';
  } else if (name.includes('arrival') || name.includes('llegada') || name.includes('geliş') || name.includes('karşılama')) {
    return '💝';
  } else if (name.includes('end') || name.includes('fin') || name.includes('bitiş') || name.includes('despedida')) {
    return '🎉';
  } else if (name.includes('reception') || name.includes('resepsiyon')) {
    return '🍾';
  }
  return '⏰'; // Default icon
}

// Parse time string (HH:MM) to minutes for sorting
function parseTimeToMinutes(time: string): number {
  const parts = time.split(':');
  if (parts.length !== 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

// Sort schedule items by time
function sortByTime(items: ScheduleItem[]): ScheduleItem[] {
  return [...items].sort((a, b) => {
    const timeA = parseTimeToMinutes(a.time);
    const timeB = parseTimeToMinutes(b.time);
    return timeA - timeB;
  });
}

export function ScheduleTimeline({ scheduleItems }: ScheduleTimelineProps) {
  const { lang } = useI18n();
  const [hiddenConnectors, setHiddenConnectors] = useState<Set<number>>(new Set());
  const [connectorWidths, setConnectorWidths] = useState<Map<number, number>>(new Map());
  const [rowEndConnectors, setRowEndConnectors] = useState<Map<number, { 
    horizontalWidth: number; // Extended horizontal line width (to next item on next row)
  }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter out empty items and sort by time
  // Calculate validItems before early returns to ensure hooks are always called in the same order
  const validItems = scheduleItems && scheduleItems.length > 0
    ? sortByTime(scheduleItems.filter(item => item.time && item.event))
    : [];

  // Detect row ends and calculate connector widths
  // Use useLayoutEffect to run synchronously after DOM updates
  // Always call hooks before early returns to follow Rules of Hooks
  useLayoutEffect(() => {
    // Early return inside hook if no valid items
    if (validItems.length === 0) {
      setHiddenConnectors(new Set());
      setConnectorWidths(new Map());
      setRowEndConnectors(new Map());
      return;
    }
    const checkRowEnds = () => {
      const hidden = new Set<number>();
      const widths = new Map<number, number>();
      const rowEnds = new Map<number, { 
        horizontalWidth: number;
      }>();
      
      // Last item always hides connector
      hidden.add(validItems.length - 1);

      // Check each item's position to detect row ends and calculate connector widths
      for (let i = 0; i < itemRefs.current.length - 1; i++) {
        const current = itemRefs.current[i];
        const next = itemRefs.current[i + 1];
        
        if (current && next) {
          const currentRect = current.getBoundingClientRect();
          const nextRect = next.getBoundingClientRect();
          
          // If next item is on a different row (different Y position)
          const tolerance = 10; // 10px tolerance for rounding errors
          if (Math.abs(currentRect.top - nextRect.top) > tolerance) {
            // This is a row end - calculate connector to next row
            hidden.add(i);
            
            // Calculate from icon center to next icon center
            // Icon position: time badge (24px) + mb-2 (8px) + icon center (28px desktop / 24px mobile)
            // We'll use the actual icon element position
            const currentIconElement = current.querySelector('[class*="rounded-full"]') as HTMLElement;
            const nextIconElement = next.querySelector('[class*="rounded-full"]') as HTMLElement;
            
            let currentIconY, currentIconX, nextIconY, nextIconX;
            
            if (currentIconElement && nextIconElement) {
              const currentIconRect = currentIconElement.getBoundingClientRect();
              const nextIconRect = nextIconElement.getBoundingClientRect();
              currentIconY = currentIconRect.top + currentIconRect.height / 2;
              currentIconX = currentIconRect.left + currentIconRect.width / 2;
              nextIconY = nextIconRect.top + nextIconRect.height / 2;
              nextIconX = nextIconRect.left + nextIconRect.width / 2;
            } else {
              // Fallback: estimate icon position
              const iconYOffset = 60; // top-[60px] from component
              const iconHeight = 56; // w-14 h-14 = 56px on desktop
              currentIconY = currentRect.top + iconYOffset + iconHeight / 2;
              currentIconX = currentRect.left + currentRect.width / 2;
              nextIconY = nextRect.top + iconYOffset + iconHeight / 2;
              nextIconX = nextRect.left + nextRect.width / 2;
            }
            
            // Calculate extended horizontal line: from current icon center to next icon center (wrapping to next row)
            const horizontalWidth = nextIconX - currentIconX;
            
            rowEnds.set(i, {
              horizontalWidth: horizontalWidth,
            });
          } else {
            // Same row - calculate horizontal connector width
            const currentCenterX = currentRect.left + currentRect.width / 2;
            const nextCenterX = nextRect.left + nextRect.width / 2;
            const width = nextCenterX - currentCenterX;
            widths.set(i, width);
          }
        }
      }

      setHiddenConnectors(hidden);
      setConnectorWidths(widths);
      setRowEndConnectors(rowEnds);
    };

    // Run immediately after layout
    checkRowEnds();
    
    // Also check after a short delay to catch any delayed renders
    const timeout = setTimeout(checkRowEnds, 100);
    
    window.addEventListener('resize', checkRowEnds);

    return () => {
      window.removeEventListener('resize', checkRowEnds);
      clearTimeout(timeout);
    };
  }, [validItems.length, validItems.map(item => `${item.time}-${item.event}`).join(',')]);

  // Early returns after all hooks
  if (!scheduleItems || scheduleItems.length === 0) {
    return null;
  }

  if (validItems.length === 0) {
    return null;
  }

  const isCompact = validItems.length > 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-6 w-full"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h3 
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{
            fontFamily: tokens.typography.fontFamily.serif.join(', '),
            color: tokens.colors.text.primary,
          }}
        >
          {lang === 'tr' ? 'Günün Programı' : 'Program of the Day'}
        </h3>
        <p 
          className="text-sm md:text-base"
          style={{ color: tokens.colors.text.secondary }}
        >
          {lang === 'tr' 
            ? 'Sizin için hazırladıklarımız'
            : 'What we have prepared for you'}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative w-full" ref={containerRef}>
        {/* CSS for responsive width calculation */}
        <style dangerouslySetInnerHTML={{ __html: `
          .timeline-item-dynamic {
            width: clamp(100px, calc((100% - var(--total-gap-mobile)) / var(--item-count)), 180px);
          }
          @media (min-width: 768px) {
            .timeline-item-dynamic {
              width: clamp(120px, calc((100% - var(--total-gap-desktop)) / var(--item-count)), 200px);
            }
          }
        `}} />
        {/* Timeline items */}
        <div 
          className="relative flex flex-nowrap justify-center w-full px-4 gap-4 md:gap-6"
          style={{
            '--item-count': validItems.length,
            '--total-gap-mobile': validItems.length > 1 ? `${(validItems.length - 1) * 1}rem` : '0rem',
            '--total-gap-desktop': validItems.length > 1 ? `${(validItems.length - 1) * 1.5}rem` : '0rem',
          } as React.CSSProperties}
        >
          {validItems.map((item, index) => {
            const shouldHideConnector = hiddenConnectors.has(index);
            const isFirst = index === 0;
            const connectorWidth = connectorWidths.get(index);
            
            return (
              <motion.div
                key={`${item.time}-${item.event}-${index}`}
                ref={(el) => { itemRefs.current[index] = el; }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative flex-shrink-0 timeline-item-dynamic"
              >
                {/* Left connector (başlangıç çizgisi) - only for first item */}
                {isFirst && (
                  <div 
                    className="absolute top-[60px] right-[50%] h-0.5 z-0"
                    style={{ 
                      backgroundColor: 'rgba(200, 162, 74, 0.3)',
                      width: '50%',
                    }}
                  />
                )}

                {/* Right connecting line - horizontal for same row */}
                {!shouldHideConnector && connectorWidth && (
                  <div 
                    className="absolute top-[60px] left-[50%] h-0.5 z-0"
                    style={{ 
                      backgroundColor: 'rgba(200, 162, 74, 0.3)',
                      width: `${connectorWidth}px`,
                    }}
                  />
                )}
                
                {/* Row end connector - extended horizontal line wrapping to next row */}
                {shouldHideConnector && rowEndConnectors.has(index) && (
                  <div 
                    className="absolute top-[60px] left-[50%] h-0.5 z-0"
                    style={{ 
                      backgroundColor: 'rgba(200, 162, 74, 0.3)',
                      width: `${rowEndConnectors.get(index)!.horizontalWidth}px`,
                    }}
                  />
                )}
                
                {/* Fallback for when width is not calculated yet */}
                {!shouldHideConnector && !connectorWidth && !rowEndConnectors.has(index) && (
                  <>
                    {/* Mobile: gap-4 = 1rem */}
                    <div 
                      className="md:hidden absolute top-[60px] left-[50%] h-0.5 z-0"
                      style={{ 
                        backgroundColor: 'rgba(200, 162, 74, 0.3)',
                        width: 'calc(100% + 1rem)',
                      }}
                    />
                    {/* Desktop: gap-6 = 1.5rem */}
                    <div 
                      className="hidden md:block absolute top-[60px] left-[50%] h-0.5 z-0"
                      style={{ 
                        backgroundColor: 'rgba(200, 162, 74, 0.3)',
                        width: 'calc(100% + 1.5rem)',
                      }}
                    />
                  </>
                )}

                {/* Time badge */}
                <div className="relative z-10 mb-2">
                  <div 
                    className={`inline-block rounded-full font-semibold ${isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
                    style={{
                      backgroundColor: 'rgba(200, 162, 74, 0.15)',
                      color: tokens.colors.text.primary,
                      border: '1px solid rgba(200, 162, 74, 0.3)',
                    }}
                  >
                    {item.time}
                  </div>
                </div>

                {/* Icon circle */}
                <div className="relative z-10 flex justify-center mb-3">
                  <div 
                    className={`rounded-full flex items-center justify-center ${isCompact ? 'w-10 h-10 md:w-11 md:h-11 text-lg md:text-xl' : 'w-12 h-12 md:w-14 md:h-14 text-xl md:text-2xl'}`}
                    style={{
                      backgroundColor: 'var(--bg-panel-strong)',
                      border: '2px solid rgba(200, 162, 74, 0.3)',
                    }}
                  >
                    {item.icon || getEventIcon(item.event)}
                  </div>
                </div>

                {/* Event title */}
                <div className="text-center">
                  <h4 
                    className={`font-semibold mb-1 ${isCompact ? 'text-xs md:text-sm' : 'text-sm md:text-base'}`}
                    style={{ color: tokens.colors.text.primary }}
                  >
                    {item.event}
                  </h4>
                  {item.description && (
                    <p 
                      className={`leading-relaxed ${isCompact ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm'}`}
                      style={{ color: tokens.colors.text.secondary }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

