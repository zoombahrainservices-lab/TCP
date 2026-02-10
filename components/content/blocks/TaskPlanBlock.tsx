import { TaskPlanBlock as TaskPlanBlockType } from '@/lib/blocks/types';

export default function TaskPlanBlock({ id, title, description, duration, tasks }: TaskPlanBlockType) {
  return (
    <div className="task-plan-block mb-6 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-[#ff6a38]/30">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#2a2416] dark:text-white mb-2">
          {title}
        </h3>
        {duration && (
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Duration: {duration}
          </p>
        )}
        {description && (
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div key={index} className="task-item p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              {task.week && (
                <div className="flex-shrink-0 w-16 h-16 bg-[#ff6a38] rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-white/80 uppercase">Week</div>
                    <div className="text-xl font-bold text-white">{task.week}</div>
                  </div>
                </div>
              )}
              
              <div className="flex-1">
                <h4 className="text-lg font-bold text-[#2a2416] dark:text-white mb-1">
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {task.description}
                  </p>
                )}
                {task.items && task.items.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {task.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-[#ff6a38] font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
