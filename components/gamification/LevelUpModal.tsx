'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ 
  newLevel, 
  onClose 
}: LevelUpModalProps) {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
          {newLevel}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Level Up!
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You've reached Level {newLevel}! Keep building momentum.
        </p>
        
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
