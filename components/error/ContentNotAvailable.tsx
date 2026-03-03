'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface ContentNotAvailableProps {
  title?: string;
  message?: string;
  backUrl?: string;
  backLabel?: string;
}

export default function ContentNotAvailable({
  title = 'Content Not Available',
  message = 'This content is not ready yet. Please check back later or continue with available chapters.',
  backUrl = '/dashboard',
  backLabel = 'Go to Dashboard',
}: ContentNotAvailableProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-[#FFF8E7] to-[#FFE8C5] dark:from-[#0a1628] dark:to-[#1a2844] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-[#ff6a38]/10 dark:bg-[#ff6a38]/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-[#ff6a38]" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4"
        >
          {title}
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-8 leading-relaxed"
        >
          {message}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={handleGoBack}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all bg-[#ff6a38] hover:bg-[#ff5722] text-white shadow-lg hover:shadow-xl"
          >
            {backLabel}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
