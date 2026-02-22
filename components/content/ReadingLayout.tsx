'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { X, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface ReadingLayoutProps {
  children: ReactNode;
  currentProgress: number; // 0-100
  onClose?: () => void;
  showDownloadButton?: boolean;
  downloadUrl?: string;
  className?: string;
}

export default function ReadingLayout({
  children,
  currentProgress,
  onClose,
  showDownloadButton = false,
  downloadUrl,
  className = '',
}: ReadingLayoutProps) {
  const router = useRouter();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className={`fixed inset-0 w-full h-full min-w-full min-h-screen bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <header className="flex-shrink-0 w-full bg-white/95 dark:bg-[#0a1628]/95 backdrop-blur-sm shadow-sm z-10">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/TCP-logo.png"
              alt="TCP Logo"
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>

          <div className="flex items-center gap-3">
            {showDownloadButton && downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#ff6a38] transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex-shrink-0 h-2 bg-gray-200 dark:bg-gray-800">
        <motion.div
          className="h-full bg-[#ff6a38]"
          initial={{ width: 0 }}
          animate={{ width: `${currentProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
