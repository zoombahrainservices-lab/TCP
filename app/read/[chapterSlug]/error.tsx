'use client';

import { useEffect } from 'react';
import ContentNotAvailable from '@/components/error/ContentNotAvailable';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Chapter reading error:', error);
  }, [error]);

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
      message="An unexpected error occurred while loading this chapter. Please try again or go back to the dashboard."
      backUrl="/dashboard"
      backLabel="Go to Dashboard"
    />
  );
}
