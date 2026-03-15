import type { FrameworkIntroBlock as Props } from '@/lib/blocks/types';

export default function FrameworkIntroBlock({
  frameworkCode,
  title,
  description,
  letters,
  accentColor = '#f7b418',
}: Props) {
  const _unused = { title, description };
  
  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      {/* Framework Code - Customizable color heading */}
      <div className="text-center mb-6">
        <h1 
          className="text-5xl font-black tracking-wider"
          style={{ color: accentColor }}
        >
          {frameworkCode}
        </h1>
      </div>
      
      {/* Letter Breakdown - Compact vertical list with custom colors */}
      <div className="space-y-2.5">
        {letters.map(({ letter, meaning, color }, index) => {
          const letterColor = color || accentColor;
          return (
            <div 
              key={`${letter}-${index}`}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div 
                className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center"
                style={{ backgroundColor: letterColor }}
              >
                <span className="text-xl font-black text-white">
                  {letter}
                </span>
              </div>
              <span className="text-base md:text-lg font-medium text-gray-900 dark:text-white">
                {meaning}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
