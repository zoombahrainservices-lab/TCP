'use client';

import React from 'react';

export default function AnimatedSignalTower() {
  return (
    <>
      <style jsx>{`
        @keyframes signalPulse {
          0%, 100% {
            opacity: 1;
            filter: drop-shadow(0 0 8px rgba(247, 218, 13, 1)) 
                    drop-shadow(0 0 12px rgba(247, 218, 13, 0.8));
          }
          50% {
            opacity: 0.6;
            filter: drop-shadow(0 0 3px rgba(247, 218, 13, 0.5));
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.15;
          }
        }
        
        @keyframes wavePulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        .signal-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .signal-glow {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(247, 218, 13, 0.4);
          filter: blur(4px);
          animation: glowPulse 1.5s ease-in-out infinite;
        }
        
        .signal-waves {
          position: absolute;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .wave-ring {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #F7DA0D;
          animation: wavePulse 2s ease-out infinite;
        }
        
        .signal-svg {
          width: 20px;
          height: 20px;
          position: relative;
          z-index: 1;
          animation: signalPulse 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="signal-container">
        <div className="signal-glow" />
        <div className="signal-waves">
          <div className="wave-ring" style={{ animationDelay: '0s' }} />
          <div className="wave-ring" style={{ animationDelay: '0.7s' }} />
          <div className="wave-ring" style={{ animationDelay: '1.4s' }} />
        </div>
        <svg
          className="signal-svg"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tower base/stand */}
          <path
            d="M10 20 L8 24 L16 24 L14 20 Z"
            fill="#F7DA0D"
            stroke="#C9A30A"
            strokeWidth="0.5"
          />
          
          {/* Tower pole */}
          <rect
            x="11"
            y="12"
            width="2"
            height="8"
            fill="#F7DA0D"
            stroke="#C9A30A"
            strokeWidth="0.5"
          />
          
          {/* Central dot/transmitter */}
          <circle
            cx="12"
            cy="10"
            r="3"
            fill="#F7DA0D"
            stroke="#C9A30A"
            strokeWidth="0.5"
          />
          
          {/* Signal waves */}
          <path
            d="M12 7 Q 8 7 6 4"
            stroke="#F7DA0D"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M12 7 Q 16 7 18 4"
            stroke="#F7DA0D"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M12 7 Q 7 6 4 2"
            stroke="#F7DA0D"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M12 7 Q 17 6 20 2"
            stroke="#F7DA0D"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>
    </>
  );
}
