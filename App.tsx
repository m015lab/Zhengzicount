import React, { useState, useCallback, useRef, useEffect } from 'react';
import ZhengChar from './components/ZhengChar';
import { IconReset, IconUndo, IconSun, IconMoon } from './components/Icons';
import { HapticType } from './types';

export default function App() {
  const [count, setCount] = useState<number>(0);
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize dark mode from system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const fullChars = Math.floor(count / 5);
  const currentStrokes = count % 5;

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDarkMode(prev => !prev);
    // Haptic feedback for switch
    triggerHaptic('light');
  };

  const triggerHaptic = (type: HapticType) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'heavy') {
        navigator.vibrate([30, 50, 30]); // Heavy vibration
      } else if (type === 'light') {
        navigator.vibrate(15); // Light vibration
      } else if (type === 'medium') {
        navigator.vibrate(40); // Medium vibration
      }
    }
  };

  const handleIncrement = useCallback(() => {
    // If confirming reset, tapping elsewhere cancels the reset state
    if (resetConfirm) {
      setResetConfirm(false);
      return;
    }

    setCount(prev => {
      const newCount = prev + 1;
      const isComplete = newCount % 5 === 0;

      triggerHaptic(isComplete ? 'heavy' : 'light');

      return newCount;
    });
  }, [resetConfirm]);

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResetConfirm(false); 
    if (count > 0) {
      setCount(prev => prev - 1);
      triggerHaptic('light');
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!resetConfirm) {
      // First tap: Enter confirmation state
      setResetConfirm(true);
      triggerHaptic('medium');

      // Auto cancel after 3 seconds
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(() => {
        setResetConfirm(false);
      }, 3000);
    } else {
      // Second tap: Execute reset
      setCount(0);
      setResetConfirm(false);
      triggerHaptic('heavy');
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="flex flex-col h-screen transition-colors duration-500 bg-white dark:bg-stone-950 text-gray-900 dark:text-stone-200 font-sans select-none touch-manipulation cursor-pointer overflow-hidden"
      onClick={handleIncrement}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Top Bar: Theme Toggle & Count */}
      <div className="flex-none pt-12 pb-4 px-8 flex justify-between items-center z-20">
        <button
          onClick={toggleTheme}
          className="p-3 -ml-3 rounded-full text-gray-400 dark:text-stone-600 hover:bg-gray-100 dark:hover:bg-stone-800 hover:text-gray-900 dark:hover:text-stone-200 transition-all duration-300"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <IconSun /> : <IconMoon />}
        </button>

        <span className="font-mono text-5xl font-light tracking-tighter transition-all duration-300 text-gray-800 dark:text-stone-100">
          {count}
        </span>
      </div>

      {/* Main Writing Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        <div className="relative z-10 transition-opacity duration-300 text-gray-900 dark:text-stone-100">
          <ZhengChar
            strokes={currentStrokes === 0 && count > 0 ? 5 : currentStrokes}
            size="large"
          />
        </div>

        {count === 0 && (
          <p className="absolute mt-36 text-gray-300 dark:text-stone-800 text-xs tracking-[0.2em] uppercase animate-pulse font-medium">
            Tap Screen
          </p>
        )}
      </div>

      {/* History / Completed Characters Area */}
      <div className="flex-none h-40 px-6 py-4 overflow-y-auto z-20 mask-gradient-b">
        <div className="flex flex-wrap content-start justify-center gap-2 opacity-60 text-gray-700 dark:text-stone-500 transition-colors duration-300">
          {Array.from({ length: fullChars }).map((_, i) => (
            <ZhengChar key={i} strokes={5} size="small" />
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex-none pb-10 px-10 flex justify-between items-center z-30 bg-white dark:bg-stone-950 transition-colors duration-500">
        
        {/* Placeholder for layout balance */}
        <div className="w-12"></div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className={`p-4 rounded-full transition-all duration-200 focus:outline-none ${
            resetConfirm
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 opacity-100 scale-110 shadow-md ring-1 ring-red-100 dark:ring-red-900/40'
              : 'text-gray-400 dark:text-stone-600 opacity-60 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-stone-900 hover:text-gray-900 dark:hover:text-stone-200'
          }`}
          title="Reset"
          aria-label="Reset Count"
        >
          <IconReset isConfirming={resetConfirm} />
        </button>

        {/* Undo Button */}
        <button
          onClick={handleUndo}
          disabled={count === 0}
          className={`p-4 rounded-full transition-all duration-200 focus:outline-none ${
            count === 0 
              ? 'invisible opacity-0' 
              : 'text-gray-400 dark:text-stone-600 opacity-60 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-stone-900 hover:text-gray-900 dark:hover:text-stone-200'
          }`}
          title="Undo"
          aria-label="Undo Last Count"
        >
          <IconUndo />
        </button>
      </div>
    </div>
  );
}