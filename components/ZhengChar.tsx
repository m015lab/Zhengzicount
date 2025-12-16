import React from 'react';
import { ZhengCharProps } from '../types';

interface ExtendedZhengCharProps extends ZhengCharProps {
  className?: string;
}

const ZhengChar: React.FC<ExtendedZhengCharProps> = ({ strokes, size = "large", className = "" }) => {
  // Define paths with their approximate lengths to enable the "drawing" animation.
  const strokeData = [
    { d: "M15,20 H85", length: 70 }, // 1. Top Horizontal
    { d: "M50,20 V90", length: 70 }, // 2. Middle Vertical
    { d: "M50,55 H85", length: 35 }, // 3. Right Middle Horizontal
    { d: "M28,55 V90", length: 35 }, // 4. Left Vertical (Structure support)
    { d: "M15,90 H85", length: 70 }  // 5. Bottom Horizontal
  ];

  // Standardize stroke width so small and large characters look identical in shape (just scaled).
  // Using 6 for both ensures the relative thickness (weight) feels the same when scaled by the parent container.
  const strokeWidth = 6;

  // Default dimensions based on size prop, but allow override via className
  const defaultSizeClass = size === 'large' ? 'w-64 h-64' : 'w-8 h-8 m-1';
  // If className provides dimensions, they will override these if we structure CSS correctly,
  // but to be safe we append the passed className last.
  
  return (
    <div
      className={`flex items-center justify-center transition-all ${defaultSizeClass} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        style={{ display: 'block' }}
      >
        {strokeData.map((stroke, index) => {
          const isVisible = index < strokes;
          return (
            <path
              key={index}
              d={stroke.d}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: stroke.length,
                strokeDashoffset: isVisible ? 0 : stroke.length,
                transition: 'stroke-dashoffset 0.25s ease-out',
                opacity: 1 
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default ZhengChar;