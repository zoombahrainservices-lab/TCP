'use client';

import { ReactNode, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Download, Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/dashboard');
    }
  };

  // Infer current chapter from URL
  let activeChapter = 1;
  const chapterMatch = pathname.match(/^\/(?:read\/chapter-(\d+)|chapter\/(\d+)|read\/([^/]+))/);
  if (chapterMatch) {
    if (chapterMatch[1] || chapterMatch[2]) {
      activeChapter = Number(chapterMatch[1] || chapterMatch[2]) || 1;
    } else if (chapterMatch[3]) {
      const slug = chapterMatch[3];
      if (slug === 'stage-star-silent-struggles') activeChapter = 1;
      if (slug === 'genius-who-couldnt-speak') activeChapter = 2;
    }
  }

  const chapterSlugByNumber: Record<number, string> = {
    1: 'stage-star-silent-struggles',
    2: 'genius-who-couldnt-speak',
  };

  const frameworkHref = `/read/${chapterSlugByNumber[activeChapter] ?? 'stage-star-silent-struggles'}/framework`;
  const techniquesHref = `/read/${chapterSlugByNumber[activeChapter] ?? 'stage-star-silent-struggles'}/techniques`;
  const followThroughHref = `/read/${chapterSlugByNumber[activeChapter] ?? 'stage-star-silent-struggles'}/follow-through`;
  const resolutionHref = `/chapter/${activeChapter}/proof`;

  const menuItems = [
    {
      id: 'map',
      label: 'Map',
      href: '/dashboard/map',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    { type: 'divider' },
    {
      id: 'reading',
      label: 'Reading',
      href: `/chapter/${activeChapter}/reading`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    { type: 'divider' },
    {
      id: 'self-check',
      label: 'Self-Check',
      href: `/chapter/${activeChapter}/assessment`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    { type: 'divider' },
    {
      id: 'framework',
      label: 'Framework',
      href: frameworkHref,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'techniques',
      label: 'Techniques',
      href: techniquesHref,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    { type: 'divider' },
    {
      id: 'resolution',
      label: 'Resolution',
      href: resolutionHref,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'follow-through',
      label: 'Follow-Through',
      href: followThroughHref,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    { type: 'divider' },
    {
      id: 'profile',
      label: 'Profile',
      href: '/dashboard/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'report',
      label: 'Report',
      href: '/dashboard/progress',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'help',
      label: 'Help',
      href: '/dashboard/help',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`fixed inset-0 w-full h-full min-w-full min-h-screen bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <header className="flex-shrink-0 w-full bg-white/95 dark:bg-[#0a1628]/95 backdrop-blur-sm shadow-sm z-10">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
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

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#000000] px-6 py-4">
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity block" onClick={() => setSidebarOpen(false)}>
            <div className="relative h-12">
              <Image 
                src="/TCP-logo.png" 
                alt="TCP" 
                width={210}
                height={48}
                className="object-contain h-12 w-auto dark:hidden"
              />
              <Image 
                src="/TCP-logo-white.png" 
                alt="TCP" 
                width={210}
                height={48}
                className="object-contain h-12 w-auto hidden dark:block"
              />
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              if (item.type === 'divider') {
                return <li key={`divider-${index}`} className="my-3 border-t border-gray-200 dark:border-gray-700"></li>;
              }
              return (
                <li key={item.id}>
                  <Link
                    href={item.href ?? '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive(item.href ?? '')
                        ? 'bg-[#0073ba] text-white dark:bg-[#4bc4dc] dark:text-gray-900'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    <span className="font-semibold text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
