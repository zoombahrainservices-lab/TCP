'use client';

import React from 'react';

export default function AnimatedLightning() {
  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 8px rgba(255, 165, 0, 1)) 
                    drop-shadow(0 0 12px rgba(255, 165, 0, 0.8));
          }
          50% {
            opacity: 0.6;
            transform: scale(0.9);
            filter: drop-shadow(0 0 3px rgba(255, 165, 0, 0.5));
          }
        }
        
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.15; }
        }
        
        .lightning-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .lightning-glow {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(255, 165, 0, 0.4);
          filter: blur(4px);
          animation: glowPulse 1.5s ease-in-out infinite;
        }
        
        .lightning-svg {
          width: 20px;
          height: 20px;
          position: relative;
          z-index: 1;
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="lightning-container">
        <div className="lightning-glow" />
        <svg
          className="lightning-svg"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 2 L6 14 L12 14 L10 22 L18 10 L12 10 L14 2 Z"
            fill="#FF8C00"
            stroke="#FF6500"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    </>
  );
}
