'use client';

import FrameworkCoverPage from '../FrameworkCoverPage';

interface FrameworkCoverBlockProps {
  frameworkCode: string;
  frameworkTitle: string;
  letters: Array<{
    letter: string;
    meaning: string;
    color?: string;
  }>;
  accentColor?: string;
  backgroundColor?: string;
}

export default function FrameworkCoverBlock({
  frameworkCode,
  frameworkTitle,
  letters,
  accentColor,
  backgroundColor,
}: FrameworkCoverBlockProps) {
  // In read mode, this will be handled separately
  // This is just for admin preview
  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-semibold rounded">
          Framework Cover Page
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <p><strong>Framework:</strong> {frameworkCode}</p>
        <p><strong>Title:</strong> {frameworkTitle}</p>
        <p><strong>Accent Color:</strong> <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: accentColor || '#f7b418' }}></span> {accentColor || '#f7b418'}</p>
        <div>
          <strong>Letters:</strong>
          <ul className="mt-2 space-y-1 ml-4">
            {letters.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="font-bold" style={{ color: item.color || accentColor || '#f7b418' }}>{item.letter}</span>
                <span>- {item.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
