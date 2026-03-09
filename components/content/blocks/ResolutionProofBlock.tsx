'use client';

import { useState, useCallback, useEffect } from 'react';
import { ResolutionProofBlock as BlockType } from '@/lib/blocks/types';
import { Lightbulb, Plus } from 'lucide-react';
import { debounce } from '@/lib/utils/debounce';
import { savePromptAnswer } from '@/app/actions/prompts';

export interface ProofSection {
  entries: string[];
}

interface ResolutionProofBlockProps extends BlockType {
  value?: { sections: ProofSection[] };
  onChange?: (value: { sections: ProofSection[] }) => void;
  chapterId?: number;
  stepId?: string;
  pageId?: string;
}

const defaultSection = (): ProofSection => ({ entries: [''] });

function ensureValue(value: unknown): { sections: ProofSection[] } {
  if (value && typeof value === 'object' && 'sections' in value && Array.isArray((value as any).sections)) {
    const sections = (value as any).sections as ProofSection[];
    if (sections.length === 0) return { sections: [defaultSection()] };
    return { sections: sections.map(s => ({
      entries: Array.isArray(s.entries) ? s.entries : [''],
    })) };
  }
  return { sections: [defaultSection()] };
}

export default function ResolutionProofBlock({
  id,
  title,
  subtitle,
  label,
  placeholder = 'Write your identity statement here',
  value,
  onChange,
  chapterId,
  stepId,
  pageId,
}: ResolutionProofBlockProps) {
  const data = ensureValue(value);
  const [sections, setSections] = useState<ProofSection[]>(data.sections);

  useEffect(() => {
    const next = ensureValue(value).sections;
    if (next.length > 0) setSections(next);
  }, [value]);

  const persist = useCallback(
    debounce((sectionsToSave: ProofSection[]) => {
      onChange?.({ sections: sectionsToSave });
      if (chapterId) {
        savePromptAnswer({
          promptKey: id,
          chapterId,
          stepId,
          pageId,
          answer: { sections: sectionsToSave },
        });
      }
    }, 1000),
    [id, chapterId, stepId, pageId, onChange]
  );

  const updateSections = useCallback(
    (next: ProofSection[]) => {
      setSections(next);
      persist(next);
    },
    [persist]
  );

  const addEntry = useCallback((sectionIndex: number) => {
    setSections(prev => {
      const next = prev.map((s, i) =>
        i === sectionIndex ? { ...s, entries: [...s.entries, ''] } : s
      );
      persist(next);
      return next;
    });
  }, [persist]);

  const addAnotherProof = useCallback(() => {
    setSections(prev => {
      const next = [...prev, defaultSection()];
      persist(next);
      return next;
    });
  }, [persist]);

  const updateEntry = useCallback(
    (sectionIndex: number, entryIndex: number, text: string) => {
      setSections(prev => {
        const next = prev.map((s, i) => {
          if (i !== sectionIndex) return s;
          const entries = [...s.entries];
          entries[entryIndex] = text;
          return { ...s, entries };
        });
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return (
    <div className="resolution-proof-block mb-6">
      <div className="p-6 rounded-xl border border-amber-200/80 bg-[#fff8e1] dark:bg-amber-900/20 dark:border-amber-700/50">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
              {subtitle}
            </p>
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-4 last:mb-0">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {sectionIndex === 0 ? label : `${label} ${sectionIndex + 1}`}
                </label>
                <div className="space-y-3">
                  {section.entries.map((entry, entryIndex) => (
                    <textarea
                      key={entryIndex}
                      value={entry}
                      onChange={(e) =>
                        updateEntry(sectionIndex, entryIndex, e.target.value)
                      }
                      placeholder={placeholder}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff6a38] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-y"
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => addEntry(sectionIndex)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff6a38] hover:bg-[#ff8c38] text-white text-sm font-semibold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={addAnotherProof}
        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#ff6a38] dark:hover:text-amber-400 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Another Proof
      </button>
    </div>
  );
}
