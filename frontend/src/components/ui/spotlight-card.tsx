'use client';

import React, { useRef, useState, type ReactNode, type CSSProperties } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: `rgba(${string})` | `hsla(${string})`;
  glowColor?: 'orange' | 'blue' | 'green' | 'purple' | 'red';
  customSize?: boolean;
  style?: CSSProperties;
}

const glowColorMap: Record<NonNullable<SpotlightCardProps['glowColor']>, string> = {
  orange: 'rgba(249, 115, 22, 0.15)',
  blue: 'rgba(59, 130, 246, 0.15)',
  green: 'rgba(34, 197, 94, 0.15)',
  purple: 'rgba(168, 85, 247, 0.15)',
  red: 'rgba(239, 68, 68, 0.15)',
};

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor,
  glowColor = 'orange',
  customSize = false,
  style,
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const resolvedSpotlight = spotlightColor ?? (glowColorMap[glowColor] as `rgba(${string})`);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function handleFocus() {
    setIsFocused(true);
    setOpacity(0.6);
  }

  function handleBlur() {
    setIsFocused(false);
    setOpacity(0);
  }

  function handleMouseEnter() {
    setOpacity(0.6);
  }

  function handleMouseLeave() {
    setOpacity(0);
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md ${customSize ? 'w-full h-full' : 'w-full'} ${className}`}
      style={style}
    >
      {/* Spotlight layer */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(circle 250px at ${position.x}px ${position.y}px, ${resolvedSpotlight}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}
