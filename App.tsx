import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import ZhengChar from './components/ZhengChar';
import { IconReset, IconUndo, IconSun, IconMoon, IconHelp } from './components/Icons';
import { HapticType } from './types';

// Helper component for the flying animation
const FlyingChar = ({ startRect, targetRect, onComplete }: { startRect: DOMRect, targetRect: DOMRect, onComplete: () => void }) => {
  const [isLanded, setIsLanded] = useState(false);

  useEffect(() => {
    // Trigger the animation. Using double requestAnimationFrame ensures the browser 
    // has painted the initial state (at startRect) before applying the target state.
    // This prevents the animation from skipping the start position, which can happen 
    // on the very first render or during layout shifts.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsLanded(true);
      });
    });

    const timer = setTimeout(onComplete, 700); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: isLanded ? targetRect.top : startRect.top,
        left: isLanded ? targetRect.left : startRect.left,
        width: isLanded ? targetRect.width : startRect.width,
        height: isLanded ? targetRect.height : startRect.height,
        pointerEvents: 'none',
        // Using a smoother bezier curve for a natural "landing" feel rather than a stiff drop
        transition: 'all 0.7s cubic-bezier(0.5, 0, 0.1, 1)',
        zIndex: 50,
      }}
      className="text-gray-900 dark:text-stone-100" 
    >
      <ZhengChar strokes={5} size="large" className="!w-full !h-full !m-0" />
    </div>
  );
};

export default function App() {
  const [count, setCount] = useState<number>(0);
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  // Animation State
  const [animatingData, setAnimatingData] = useState<{start: DOMRect, target: DOMRect} | null>(null);
  
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainCharRef = useRef<HTMLDivElement>(null);
  // Renamed for clarity: this ref now points to the inner container of items
  const historyListRef = useRef<HTMLDivElement>(null);
  // Ref for the scrollable container
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(count);

  const fullChars = Math.floor(count / 5);
  const currentStrokes = count % 5;

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Animation Trigger
  useLayoutEffect(() => {
    const prevCount = prevCountRef.current;
    
    // Check if we just completed a character (e.g., 4 -> 5, 9 -> 10)
    if (count > 0 && count % 5 === 0 && count > prevCount) {
      // 0. Auto-scroll to bottom BEFORE calculating positions
      // This ensures the new slot is visible and the coordinates are correct relative to the viewport.
      if (historyScrollRef.current) {
        historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
      }

      // 1. Get Start Position (Main Char wrapper)
      const startRect = mainCharRef.current?.getBoundingClientRect();
      
      // 2. Get Target Position (The new history item)
      // We access the last child of the flex container directly
      const historyChildren = historyListRef.current?.children;
      const lastChild = historyChildren ? historyChildren[historyChildren.length - 1] : null;
      
      if (lastChild) {
        const targetRect = lastChild.getBoundingClientRect();
        if (startRect) {
          setAnimatingData({ start: startRect, target: targetRect });
        }
      }
    }
    
    // Cancel animation if we undo out of a full character
    if (count < prevCount && prevCount % 5 === 0) {
        setAnimatingData(null);
    }

    prevCountRef.current = count;
  }, [count]);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDarkMode(prev => !prev);
    triggerHaptic('light');
  };

  const toggleHelp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHelp(prev => !prev);
    triggerHaptic('light');
  };

  const triggerHaptic = (type: HapticType) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'heavy') navigator.vibrate([30, 50, 30]);
      else if (type === 'light') navigator.vibrate(15);
      else if (type === 'medium') navigator.vibrate(40);
    }
  };

  const handleIncrement = useCallback(() => {
    if (resetConfirm) {
      setResetConfirm(false);
      return;
    }
    if (showHelp) {
      setShowHelp(false);
      return;
    }

    setCount(prev => {
      const newCount = prev + 1;
      const isComplete = newCount % 5 === 0;
      triggerHaptic(isComplete ? 'heavy' : 'light');
      return newCount;
    });
  }, [resetConfirm, showHelp]);

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
      setResetConfirm(true);
      triggerHaptic('medium');
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(() => setResetConfirm(false), 3000);
    } else {
      setCount(0);
      setResetConfirm(false);
      triggerHaptic('heavy');
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    }
  };

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
      {/* Top Bar */}
      <div className="flex-none pt-12 pb-4 px-8 flex justify-between items-center z-20">
        <button
          onClick={toggleTheme}
          className="p-3 -ml-3 rounded-full text-gray-400 dark:text-stone-600 hover:bg-gray-100 dark:hover:bg-stone-800 hover:text-gray-900 dark:hover:text-stone-200 transition-all duration-300"
        >
          {isDarkMode ? <IconSun /> : <IconMoon />}
        </button>
        <span className="font-mono text-5xl font-light tracking-tighter transition-all duration-300 text-gray-800 dark:text-stone-100">
          {count}
        </span>
      </div>

      {/* Main Writing Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        {/* We wrap the Main Char in a ref to measure its position */}
        <div 
            ref={mainCharRef}
            className="relative z-10 transition-opacity duration-300 text-gray-900 dark:text-stone-100"
        >
          <ZhengChar
            strokes={currentStrokes}
            size="large"
          />
        </div>

        {count === 0 && (
          <p className="absolute mt-36 text-gray-300 dark:text-stone-800 text-xs tracking-[0.2em] uppercase animate-pulse font-medium">
            点击屏幕
          </p>
        )}
      </div>

      {/* History Area */}
      <div 
        ref={historyScrollRef}
        className="flex-none h-40 px-6 py-4 overflow-y-auto z-20"
      >
        <div 
          ref={historyListRef}
          className="flex flex-wrap content-start justify-center gap-2 opacity-60 text-gray-700 dark:text-stone-500 transition-colors duration-300 min-h-[2.5rem]"
        >
          {Array.from({ length: fullChars }).map((_, i) => {
            // Check if this is the item currently being animated into existence
            const isLast = i === fullChars - 1;
            const isAnimating = !!animatingData;
            
            return (
              <div 
                key={i} 
                className={`transition-opacity duration-300 ${
                    // Hide the new item while the animation is playing
                    (isLast && isAnimating) ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <ZhengChar strokes={5} size="small" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Animation Overlay */}
      {animatingData && (
        <FlyingChar 
            startRect={animatingData.start} 
            targetRect={animatingData.target} 
            onComplete={() => setAnimatingData(null)} 
        />
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 dark:bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div 
            className="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100 dark:border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-stone-100 tracking-tight">使用说明</h2>
            
            <ul className="space-y-4 text-sm text-gray-600 dark:text-stone-400">
              <li className="flex items-start gap-3">
                <span className="bg-gray-100 dark:bg-stone-800 p-1.5 rounded-md text-gray-800 dark:text-stone-200">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="1"></circle></svg>
                </span>
                <span>
                  <strong className="block text-gray-900 dark:text-stone-200 mb-0.5">点击屏幕</strong>
                  点击屏幕任意位置增加计数，5 笔写成一个“正”字。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-gray-100 dark:bg-stone-800 p-1.5 rounded-md text-gray-800 dark:text-stone-200">
                    <IconUndo />
                </span>
                <span>
                  <strong className="block text-gray-900 dark:text-stone-200 mb-0.5">撤销</strong>
                  点击箭头按钮撤销上一次操作。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-gray-100 dark:bg-stone-800 p-1.5 rounded-md text-gray-800 dark:text-stone-200">
                    <IconReset isConfirming={false} />
                </span>
                <span>
                  <strong className="block text-gray-900 dark:text-stone-200 mb-0.5">重置</strong>
                  点击一次解锁，再次点击清空所有计数。
                </span>
              </li>
            </ul>

            <button 
              onClick={(e) => {
                  e.stopPropagation();
                  setShowHelp(false);
              }}
              className="mt-8 w-full py-3 bg-gray-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium active:scale-95 transition-transform"
            >
              知道了
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex-none pb-10 px-10 flex justify-between items-center z-30 bg-white dark:bg-stone-950 transition-colors duration-500">
        <button
          onClick={toggleHelp}
          className="p-4 rounded-full transition-all duration-200 focus:outline-none text-gray-400 dark:text-stone-600 opacity-60 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-stone-900 hover:text-gray-900 dark:hover:text-stone-200"
        >
          <IconHelp />
        </button>

        <button
          onClick={handleReset}
          className={`p-4 rounded-full transition-all duration-200 focus:outline-none ${
            resetConfirm
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 opacity-100 scale-110 shadow-md ring-1 ring-red-100 dark:ring-red-900/40'
              : 'text-gray-400 dark:text-stone-600 opacity-60 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-stone-900 hover:text-gray-900 dark:hover:text-stone-200'
          }`}
        >
          <IconReset isConfirming={resetConfirm} />
        </button>
        
        <button
          onClick={handleUndo}
          disabled={count === 0}
          className={`p-4 rounded-full transition-all duration-200 focus:outline-none ${
            count === 0 
              ? 'invisible opacity-0' 
              : 'text-gray-400 dark:text-stone-600 opacity-60 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-stone-900 hover:text-gray-900 dark:hover:text-stone-200'
          }`}
        >
          <IconUndo />
        </button>
      </div>
    </div>
  );
}