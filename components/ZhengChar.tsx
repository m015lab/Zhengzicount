import React from 'react';
import { ZhengCharProps } from '../types';

const ZhengChar: React.FC<ZhengCharProps> = ({ strokes, size = "large" }) => {
  // SVG Path Definitions for the character "正"
  const paths = [
    "M15,20 H85",      // 1. Top Horizontal
    "M50,20 V90",      // 2. Middle Vertical
    "M50,55 H85",      // 3. Right Middle Horizontal
    "M28,55 V90",      // 4. Left Vertical (Structure support)
    "M15,90 H85"       // 5. Bottom Horizontal
  ];

  const strokeWidth = size === "large" ? 6 : 8;

  return (
    <div
      className={`flex items-center justify-center transition-all ${
        size === 'large' ? 'w-64 h-64' : 'w-8 h-8 m-1'
      }`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        style={{ display: 'block' }}
      >
        {paths.map((d, index) => (
          <path
            key={index}
            d={d}
            fill="none"
            stroke="currentColor" // Changed to currentColor for better theme integration
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: index < strokes ? 1 : 0,
              transition: 'opacity 0.1s ease-out'
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default ZhengChar;