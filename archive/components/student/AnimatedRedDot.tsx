'use client';

import React from 'react';

export default function AnimatedRedDot() {
  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 8px rgba(239, 68, 68, 1)) 
                    drop-shadow(0 0 12px rgba(239, 68, 68, 0.8));
          }
          50% {
            opacity: 0.6;
            transform: scale(0.9);
            filter: drop-shadow(0 0 3px rgba(239, 68, 68, 0.5));
          }
        }
        
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.15; }
        }
        
        .red-dot-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .red-dot-glow {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.4);
          filter: blur(4px);
          animation: glowPulse 1.5s ease-in-out infinite;
        }
        
        .red-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ef4444;
          position: relative;
          z-index: 1;
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="red-dot-container">
        <div className="red-dot-glow" />
        <div className="red-dot" />
      </div>
    </>
  );
}
