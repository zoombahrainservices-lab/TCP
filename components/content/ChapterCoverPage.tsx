'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

interface ChapterCoverPageProps {
  chapterNumber: number;
  title: string;
  subtitle?: string | null;
  onContinue: () => void;
  onDownload?: () => void;
  showDownloadButton?: boolean;
}

export default function ChapterCoverPage({
  chapterNumber,
  title,
  subtitle,
  onContinue,
  onDownload,
  showDownloadButton = false,
}: ChapterCoverPageProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/Chapter_cover_page.png"
          alt="Chapter Cover Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Dark gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 sm:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Chapter Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-[#f7b418] text-lg sm:text-xl md:text-2xl font-bold tracking-wider uppercase mb-4">
              Chapter {chapterNumber}
            </h2>
          </motion.div>

          {/* Chapter Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight uppercase">
              {title}
            </h1>
          </motion.div>

          {/* Subtitle (if exists) */}
          {subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
                {subtitle}
              </p>
            </motion.div>
          )}

          {/* Progress Dots (decorative) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-2 py-6"
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 0 ? 'bg-[#f7b418]' : 'bg-gray-500'
                }`}
              />
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onContinue}
              className="px-8 py-3.5 bg-[#f7b418] hover:bg-[#e5a510] text-black font-bold text-base sm:text-lg rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wide"
            >
              Continue
            </button>
            {showDownloadButton && onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-semibold shadow-lg transition-all border border-white/20"
              >
                <Download className="w-4 h-4" />
                Download Chapter Report
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
