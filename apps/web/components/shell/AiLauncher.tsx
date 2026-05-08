'use client';

/**
 * Floating AI assistant launcher · bottom-right corner.
 * Also shows a smaller help button above it.
 */

export function AiLauncher() {
  return (
    <>
      {/* Help launcher */}
      <button
        className="fixed bottom-[88px] right-[22px] z-50 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel text-ink-3 shadow-e60-md"
        aria-label="Help"
        title="Help"
      >
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
          <circle cx="7" cy="7" r="5.5" />
          <path d="M5.5 5.5a1.5 1.5 0 113 0c0 1-1.5 1.5-1.5 2.5M7 10v.1" strokeLinecap="round" />
        </svg>
      </button>

      {/* AI launcher */}
      <button
        className="fixed bottom-[22px] right-[22px] z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full text-white transition-transform hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #ff8c2d, #f04e3e)',
          boxShadow:
            '0 8px 22px rgba(255, 140, 45, 0.35), 0 2px 6px rgba(255, 140, 45, 0.2)',
        }}
        aria-label="E6.0 AI assistant"
        title="E6.0 AI assistant"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[22px] w-[22px]">
          <path
            d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4" />
        </svg>
        <span
          className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-canvas bg-nfq-red text-[10px] font-semibold text-white"
        >
          5
        </span>
      </button>
    </>
  );
}
