'use client';

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
    <div className={`flex items-center justify-center gap-4 sm:gap-6 ${className}`}>
      {/* Previous Button - only show if not first page */}
      {showPrevious && !isFirst && (
        <button
          onClick={handlePrevious}
          disabled={isLoading}
          className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 min-h-[48px] min-w-[120px] sm:min-w-[140px] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
      )}

      {/* Next/Complete Button */}
      {showNext && (
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all bg-[#FF6B35] hover:bg-[#FF5722] text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[120px] sm:min-w-[140px] touch-manipulation"
        >
          {isLoading ? 'Loading...' : getNextButtonLabel()}
        </button>
      )}
    </div>
  );
}
