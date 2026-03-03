'use client';

import { useEffect, useState } from 'react';
import { Edit } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface AdminEditButtonProps {
  chapterId: string;
  pageId: string;
  stepId?: string;
}

export default function AdminEditButton({ chapterId, pageId, stepId }: AdminEditButtonProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/check-admin');
      const data = await response.json();
      setIsAdmin(data.isAdmin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  if (!isAdmin) return null;

  // Build return URL so the editor can send the user back
  const search = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;
  const editUrl = `/admin/chapters/${chapterId}/pages/${pageId}/edit?from=reading&returnUrl=${encodeURIComponent(currentPath)}`;

  return (
    <Link href={editUrl}>
      <button
        className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg min-h-[48px] min-w-[120px] sm:min-w-[140px] touch-manipulation flex items-center justify-center gap-2"
        title="Edit this page (Admin)"
      >
        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Edit</span>
      </button>
    </Link>
  );
}
