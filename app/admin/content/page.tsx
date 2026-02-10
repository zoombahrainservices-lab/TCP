import { requireAuth } from '@/lib/auth/guards';
import { getAllParts, getAllChapters } from '@/lib/content/queries';
import type { Chapter } from '@/lib/content/types';
import Link from 'next/link';
import { BookOpen, Users, Settings, BarChart3, FileText } from 'lucide-react';

export default async function AdminContentPage() {
  // Require admin role
  await requireAuth('admin');

  const parts = await getAllParts();
  const chapters = await getAllChapters();

  // Group chapters by part
  const chaptersByPart = chapters.reduce((acc, chapter) => {
    const partId = chapter.part_id;
    if (!acc[partId]) {
      acc[partId] = [];
    }
    acc[partId].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Content Management
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage chapters, pages, and content blocks
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <FileText className="w-10 h-10 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Parts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{parts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <BookOpen className="w-10 h-10 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chapters</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{chapters.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {chapters.filter(c => c.is_published).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <Settings className="w-10 h-10 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {chapters.filter(c => !c.is_published).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters by Part */}
        <div className="space-y-8">
          {parts.map(part => {
            const partChapters = chaptersByPart[part.id] || [];
            
            return (
              <div key={part.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {part.title}
                </h2>
                
                {partChapters.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No chapters in this part yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {partChapters.map((chapter: Chapter) => (
                      <Link
                        key={chapter.id}
                        href={`/admin/content/chapters/${chapter.id}`}
                        className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#ff6a38]">
                              Ch {chapter.chapter_number}
                            </span>
                            {chapter.is_published ? (
                              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">
                                Published
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded">
                                Draft
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {chapter.title}
                        </h3>
                        {chapter.subtitle && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {chapter.subtitle}
                          </p>
                        )}
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                          {chapter.slug}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Create New Chapter
              </p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Import from Template
              </p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                View Analytics
              </p>
            </button>
          </div>
        </div>

        {/* Implementation Note */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📝 Development Note
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            The full block editor interface is coming in Phase 2. For now, you can:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>View and manage chapter metadata</li>
            <li>Toggle publish status via SQL</li>
            <li>Edit content blocks directly in the database</li>
            <li>Run the migration script to add more content</li>
          </ul>
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-3">
            See <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">MIGRATION_GUIDE.md</code> for detailed instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
