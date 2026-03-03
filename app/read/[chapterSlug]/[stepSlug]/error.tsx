'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContentNotAvailable from '@/components/error/ContentNotAvailable';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error to console in development
    console.error('Global error caught:', error);
  }, [error]);

  // Check for specific error types
  const isHooksError = error.message?.includes('hooks') || error.message?.includes('Rendered more hooks');
  const isContentError = error.message?.includes('content') || error.message?.includes('not available');

  if (isHooksError || isContentError) {
    return (
      <ContentNotAvailable
        title="Content Not Available"
        message="This content is not ready yet. We're working on adding it soon!"
        backUrl="/dashboard"
        backLabel="Go to Dashboard"
      />
    );
  }

  return (
    <ContentNotAvailable
      title="Something Went Wrong"
      message="An unexpected error occurred. Please try again or go back to the dashboard."
      backUrl="/dashboard"
      backLabel="Go to Dashboard"
    />
  );
}
