'use client';

import React from 'react';

export default function AnimatedLock() {
  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 8px rgba(13, 183, 255, 1)) 
                    drop-shadow(0 0 12px rgba(13, 183, 255, 0.8));
          }
          50% {
            opacity: 0.6;
            transform: scale(0.9);
            filter: drop-shadow(0 0 3px rgba(13, 183, 255, 0.5));
          }
        }
        
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.15; }
        }
        
        .lock-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .lock-glow {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(13, 183, 255, 0.4);
          filter: blur(4px);
          animation: glowPulse 1.5s ease-in-out infinite;
        }
        
        .lock-svg {
          width: 18px;
          height: 18px;
          position: relative;
          z-index: 1;
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="lock-container">
        <div className="lock-glow" />
        <svg
          className="lock-svg"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Lock body */}
          <rect
            x="6"
            y="11"
            width="12"
            height="9"
            rx="2"
            fill="#0DB7FF"
            stroke="#1f6eb7"
            strokeWidth="1"
          />
          
          {/* Lock shackle/arch */}
          <path
            d="M8 11 L8 8 C8 5.79086 9.79086 4 12 4 C14.2091 4 16 5.79086 16 8 L16 11"
            stroke="#0DB7FF"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Keyhole */}
          <circle
            cx="12"
            cy="15"
            r="2"
            fill="#1f6eb7"
          />
        </svg>
      </div>
    </>
  );
}
