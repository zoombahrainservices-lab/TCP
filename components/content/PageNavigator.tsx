'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageNavigatorProps {
  currentPage: number;
  totalPages: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export default function PageNavigator({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onComplete,
  showPrevious = true,
  showNext = true,
  nextLabel,
  isLoading = false,
  className = '',
}: PageNavigatorProps) {
  const isFirst = currentPage === 0;
  const isLast = currentPage === totalPages - 1;

  const handlePrevious = () => {
    if (!isFirst && onPrevious) {
      onPrevious();
    }
  };

  const handleNext = () => {
    if (isLast && onComplete) {
      onComplete();
    } else if (onNext) {
      onNext();
    }
  };

  const getNextButtonLabel = () => {
    if (nextLabel) return nextLabel;
    if (isLast) return 'Complete';
    return 'Continue';
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* Previous Button */}
      {showPrevious && (
        <button
          onClick={handlePrevious}
          disabled={isFirst || isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isFirst || isLoading
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>
      )}

      {/* Page Indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <motion.div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === currentPage
                ? 'w-8 bg-[#ff6a38]'
                : 'w-2 bg-gray-300 dark:bg-gray-700'
            }`}
            initial={false}
            animate={{
              scale: i === currentPage ? 1.1 : 1,
            }}
          />
        ))}
      </div>

      {/* Next/Complete Button */}
      {showNext && (
        <button
          onClick={handleNext}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isLoading
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'bg-[#ff6a38] hover:bg-[#ff8c38] text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          <span>{isLoading ? 'Loading...' : getNextButtonLabel()}</span>
          {!isLast && <ChevronRight className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}
