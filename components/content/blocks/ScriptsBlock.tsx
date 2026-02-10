import { ScriptsBlock as ScriptsBlockType } from '@/lib/blocks/types';
import { MessageCircle } from 'lucide-react';

export default function ScriptsBlock({ id, title, scripts }: ScriptsBlockType) {
  return (
    <div className="scripts-block mb-6">
      {title && (
        <h3 className="text-2xl font-bold text-[#2a2416] dark:text-white mb-4">
          {title}
        </h3>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {scripts.map((script) => (
          <div
            key={script.id}
            className="script-card p-5 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#ff6a38] transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <MessageCircle className="w-6 h-6 text-[#ff6a38] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-bold text-[#2a2416] dark:text-white">
                  {script.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {script.target}
                </p>
              </div>
            </div>

            {script.context && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
                {script.context}
              </p>
            )}

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-base text-[#2a2416] dark:text-white leading-relaxed">
                "{script.content}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
