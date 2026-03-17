'use client';

import { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function SelfCheckDefaultsEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaults, setDefaults] = useState<any>(null);

  useEffect(() => {
    loadDefaults();
  }, []);

  async function loadDefaults() {
    try {
      const res = await fetch('/api/admin/site-settings/self-check-defaults');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setDefaults(data.value || getInitialDefaults());
    } catch (error) {
      console.error('Error loading defaults:', error);
      setDefaults(getInitialDefaults());
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-settings/self-check-defaults', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: defaults }),
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      toast.success('Global defaults saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save defaults');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (confirm('Reset to default values? This cannot be undone.')) {
      setDefaults(getInitialDefaults());
    }
  }

  function getInitialDefaults() {
    return {
      intro: {
        title: 'Self-Check',
        subtitle: 'Take a quick snapshot of where you are in this chapter.',
        body1: 'This check is just for you. Answer based on how things feel right now, not how you wish they were.',
        body2: "It's not a test or a grade. It's a baseline for this chapter so you can see your progress as you move through the lessons.",
        highlightTitle: "You'll rate 5 statements from 1 to 7.",
        highlightBody: "Takes about a minute. Your score shows which zone you're in and what to focus on next.",
        questionsTitle: "Chapter X Self-Check",
        questionsSubtitle: "Rate each statement from 1 to 7. Be honest—only you see this.",
        styles: {
          titleColor: '#111827',
          titleSize: '5xl',
          subtitleColor: '#6b7280',
          bodyBgColor: '#ffffff',
          bodyTextColor: '#1f2937',
          highlightBgColor: '#fef3c7',
          highlightBorderColor: '#f59e0b',
          highlightTextColor: '#111827',
          buttonBgColor: '#f7b418',
          buttonHoverColor: '#e5a309',
          buttonTextColor: '#000000',
        },
      },
      result: {
        title: 'Self-Check Results',
        subtitle: 'This is your starting point for this chapter—not your ending point.',
        styles: {
          titleColor: '#111827',
          subtitleColor: '#6b7280',
          scoreBgColor: '#ffffff',
          scoreTextColor: '#111827',
          explanationBgColor: '#fef3c7',
          explanationTextColor: '#111827',
          buttonBgColor: '#ff6a38',
          buttonHoverColor: '#e55a28',
          buttonTextColor: '#ffffff',
        },
      },
    };
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Palette className="w-8 h-8" />
            Self-Check Global Defaults
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure default text and styling for self-check intro and result pages. Chapters can override these.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INTRO SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Intro Page</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={defaults?.intro?.title || ''}
                onChange={(e) => setDefaults({
                  ...defaults,
                  intro: { ...defaults.intro, title: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={defaults?.intro?.subtitle || ''}
                onChange={(e) => setDefaults({
                  ...defaults,
                  intro: { ...defaults.intro, subtitle: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Body Paragraph 1
              </label>
              <textarea
                value={defaults?.intro?.body1 || ''}
                onChange={(e) => setDefaults({
                  ...defaults,
                  intro: { ...defaults.intro, body1: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Body Paragraph 2
              </label>
              <textarea
                value={defaults?.intro?.body2 || ''}
                onChange={(e) => setDefaults({
                  ...defaults,
                  intro: { ...defaults.intro, body2: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Highlight Title
              </label>
              <input
                type="text"
                value={defaults?.intro?.highlightTitle || ''}
                onChange={(e) => setDefaults({
                  ...defaults,
                  intro: { ...defaults.intro, highlightTitle: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Highlight Body
              </label>
              <textarea
                value={defaults?.intro?.highlightBody || ''}
                onChange={(e) => setDefaults({
                  ...defaults,
                  intro: { ...defaults.intro, highlightBody: e.target.value }
                })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Questions Page</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Questions Page Title
                  </label>
                  <input
                    type="text"
                    value={defaults?.intro?.questionsTitle || ''}
                    onChange={(e) => setDefaults({
                      ...defaults,
                      intro: { ...defaults.intro, questionsTitle: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Chapter X Self-Check"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use "Chapter X" as placeholder - it will auto-populate per chapter
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Questions Page Subtitle
                  </label>
                  <input
                    type="text"
                    value={defaults?.intro?.questionsSubtitle || ''}
                    onChange={(e) => setDefaults({
                      ...defaults,
                      intro: { ...defaults.intro, questionsSubtitle: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Rate each statement from 1 to 7. Be honest—only you see this."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Intro Styling</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorField
                  label="Title Color"
                  value={defaults?.intro?.styles?.titleColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    intro: {
                      ...defaults.intro,
                      styles: { ...defaults.intro.styles, titleColor: val }
                    }
                  })}
                />
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title Size
                  </label>
                  <select
                    value={defaults?.intro?.styles?.titleSize || '5xl'}
                    onChange={(e) => setDefaults({
                      ...defaults,
                      intro: {
                        ...defaults.intro,
                        styles: { ...defaults.intro.styles, titleSize: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="3xl">3XL (1.875rem)</option>
                    <option value="4xl">4XL (2.25rem)</option>
                    <option value="5xl">5XL (3rem)</option>
                  </select>
                </div>
                <ColorField
                  label="Subtitle Color"
                  value={defaults?.intro?.styles?.subtitleColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    intro: {
                      ...defaults.intro,
                      styles: { ...defaults.intro.styles, subtitleColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Body BG"
                  value={defaults?.intro?.styles?.bodyBgColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    intro: {
                      ...defaults.intro,
                      styles: { ...defaults.intro.styles, bodyBgColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Body Text"
                  value={defaults?.intro?.styles?.bodyTextColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    intro: {
                      ...defaults.intro,
                      styles: { ...defaults.intro.styles, bodyTextColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Highlight BG"
                  value={defaults?.intro?.styles?.highlightBgColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    intro: {
                      ...defaults.intro,
                      styles: { ...defaults.intro.styles, highlightBgColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Highlight Border"
                  value={defaults?.intro?.styles?.highlightBorderColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    intro: {
                      ...defaults.intro,
                      styles: { ...defaults.intro.styles, highlightBorderColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Highlight Text"
                  value={defaults?.intro?.styles?.highlightTextColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    intro: {
                      ...defaults.intro,
                      styles: { ...defaults.intro.styles, highlightTextColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Button BG"
                  value={defaults?.intro?.styles?.buttonBgColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    intro: {
                      ...defaults.intro,
                      styles: { ...defaults.intro.styles, buttonBgColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Button Hover"
                  value={defaults?.intro?.styles?.buttonHoverColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    intro: {
                      ...defaults.intro,
                      styles: { ...defaults.intro.styles, buttonHoverColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Button Text"
                  value={defaults?.intro?.styles?.buttonTextColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    intro: {
                      ...defaults.intro,
                      styles: { ...defaults.intro.styles, buttonTextColor: val }
                    }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RESULT SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Result Page</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={defaults?.result?.title || ''}
                onChange={(e) => setDefaults({
                  ...defaults,
                  result: { ...defaults.result, title: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={defaults?.result?.subtitle || ''}
                onChange={(e) => setDefaults({
                  ...defaults,
                  result: { ...defaults.result, subtitle: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Result Styling</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorField
                  label="Title Color"
                  value={defaults?.result?.styles?.titleColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    result: {
                      ...defaults.result,
                      styles: { ...defaults.result.styles, titleColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Subtitle Color"
                  value={defaults?.result?.styles?.subtitleColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    result: {
                      ...defaults.result,
                      styles: { ...defaults.result.styles, subtitleColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Score BG"
                  value={defaults?.result?.styles?.scoreBgColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    result: {
                      ...defaults.result,
                      styles: { ...defaults.result.styles, scoreBgColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Score Text"
                  value={defaults?.result?.styles?.scoreTextColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    result: {
                      ...defaults.result,
                      styles: { ...defaults.result.styles, scoreTextColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Explanation BG"
                  value={defaults?.result?.styles?.explanationBgColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    result: {
                      ...defaults.result,
                      styles: { ...defaults.result.styles, explanationBgColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Explanation Text"
                  value={defaults?.result?.styles?.explanationTextColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    result: {
                      ...defaults.result,
                      styles: { ...defaults.result.styles, explanationTextColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Button BG"
                  value={defaults?.result?.styles?.buttonBgColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    result: {
                      ...defaults.result,
                      styles: { ...defaults.result.styles, buttonBgColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Button Hover"
                  value={defaults?.result?.styles?.buttonHoverColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    result: {
                      ...defaults.result,
                      styles: { ...defaults.result.styles, buttonHoverColor: val }
                    }
                  })}
                />
                <ColorField
                  label="Button Text"
                  value={defaults?.result?.styles?.buttonTextColor}
                  onChange={(val) => setDefaults({
                    ...defaults,
                    result: {
                      ...defaults.result,
                      styles: { ...defaults.result.styles, buttonTextColor: val }
                    }
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value?: string; onChange: (val: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
