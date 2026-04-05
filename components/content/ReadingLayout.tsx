'use client';

import { ReactNode, useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardNav } from '@/components/ui/DashboardNav';

interface ReadingLayoutProps {
  children: ReactNode;
  currentProgress: number; // 0-100
  onClose?: () => void;
  locationIndicator?: string;
  /** Optional: current chapter number for nav highlighting (otherwise inferred from URL) */
  serverCurrentChapter?: number;
  /** When true, sidebar is collapsed by default with hamburger toggle (same as chapters 1–3) */
  collapseSidebarByDefault?: boolean;
  showDownloadButton?: boolean;
  downloadUrl?: string;
  className?: string;
  /** Pass isAdmin from server to avoid repeated client fetches */
  isAdmin?: boolean;
}

export default function ReadingLayout({
  children,
  currentProgress,
  onClose,
  locationIndicator,
  serverCurrentChapter,
  collapseSidebarByDefault = true,
  showDownloadButton = false,
  downloadUrl,
  className = '',
  isAdmin = false,
}: ReadingLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/dashboard');
    }
  };

  // Infer current chapter from URL when serverCurrentChapter not provided
  let activeChapter = 1;
  const chapterMatch = pathname.match(/^\/(?:read\/chapter-(\d+)|chapter\/(\d+)|read\/([^/]+))/);
  if (chapterMatch) {
    if (chapterMatch[1] || chapterMatch[2]) {
      activeChapter = Number(chapterMatch[1] || chapterMatch[2]) || 1;
    } else if (chapterMatch[3]) {
      const slug = chapterMatch[3];
      const slugToChapterMap: Record<string, number> = {
        'stage-star-silent-struggles': 1,
        'genius-who-couldnt-speak': 2,
      };
      const chapterNMatch = slug.match(/^chapter-(\d+)$/);
      if (chapterNMatch) {
        activeChapter = Number(chapterNMatch[1]) || 1;
      } else {
        activeChapter = slugToChapterMap[slug] ?? 1;
      }
    }
  }
  const currentChapter = serverCurrentChapter ?? activeChapter;

  return (
    <div
      className={`h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300 ${className}`}
      style={{ height: '100dvh', maxHeight: '-webkit-fill-available' }}
    >
      {/* Reuse dashboard side panel (Settings + Admin Panel available here too) */}
      <DashboardNav serverCurrentChapter={currentChapter} isAdmin={isAdmin} collapseSidebarByDefault={collapseSidebarByDefault} />

      {/* Main area: progress bar + close + content */}
      <div className="flex-1 min-h-0 flex flex-col bg-[var(--color-offwhite)] dark:bg-[#0a1628]">
        {/* Top bar: toggle space + progress + optional download + close */}
        <header className="flex-shrink-0 w-full bg-white dark:bg-[#0a1628] border-b border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-full px-4 sm:px-6 py-2 flex items-center gap-3">
            {/* Spacer so progress bar starts after the hamburger toggle (lg only) */}
            <div className="hidden lg:block w-16 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              {locationIndicator ? (
                <div className="mb-1 text-xs sm:text-sm font-semibold tracking-wide text-gray-600 dark:text-gray-300">
                  {locationIndicator}
                </div>
              ) : null}
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff6a38] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              {showDownloadButton && downloadUrl && (
                <a
                  href={downloadUrl}
                  download
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#ff6a38] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
