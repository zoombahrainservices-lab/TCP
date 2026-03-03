'use client';

import { motion } from 'framer-motion';

interface FrameworkCoverPageProps {
  frameworkCode: string; // "SPARK" or "VOICE"
  frameworkTitle: string; // "The SPARK Framework"
  frameworkLabel?: string; // "FRAMEWORK: SPARK" (optional)
  letters: Array<{
    letter: string;
    meaning: string;
    color?: string;
  }>;
  onContinue: () => void;
  accentColor?: string; // Default: #f7b418 (golden amber)
  backgroundColor?: string; // Default: #FFF8E7 (cream)
}

export default function FrameworkCoverPage({
  frameworkCode,
  frameworkTitle,
  frameworkLabel,
  letters,
  onContinue,
  accentColor = '#f7b418',
  backgroundColor = '#FFF8E7',
}: FrameworkCoverPageProps) {
  return (
    <div 
      className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden px-4 py-12"
      style={{ backgroundColor }}
    >
      {/* Content Container - Matches Screenshot Design */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8"
        >
          {/* Framework Label at Top (like screenshot) */}
          {frameworkLabel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-left"
            >
              <p 
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: '#ff6b35' }}
              >
                {frameworkLabel}
              </p>
            </motion.div>
          )}

          {/* Framework Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-left"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
              {frameworkTitle}
            </h1>
          </motion.div>

          {/* Framework Code - Large Yellow Text (matching screenshot) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-8"
          >
            <h2 
              className="text-7xl sm:text-8xl md:text-9xl font-black tracking-wider"
              style={{ color: accentColor }}
            >
              {frameworkCode}
            </h2>
          </motion.div>

          {/* Letter Meanings List - Exactly Like Screenshot */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-4"
          >
            {letters.map((item, index) => (
              <motion.div
                key={item.letter}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                {/* Square Badge with Letter - Rounded Corners Like Screenshot */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-2xl text-white shadow-sm"
                  style={{ backgroundColor: item.color || accentColor }}
                >
                  {item.letter}
                </div>
                
                {/* Meaning Text */}
                <div className="text-left flex-1">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {item.meaning}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Continue Button - Orange Like Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="pt-8 text-center"
          >
            <button
              onClick={onContinue}
              className="px-12 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-white"
              style={{ backgroundColor: '#ff6b35' }}
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
