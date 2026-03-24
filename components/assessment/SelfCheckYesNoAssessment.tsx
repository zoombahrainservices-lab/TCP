'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardNav } from '@/components/ui/DashboardNav';
import { MainWithBackground } from '@/components/dashboard/MainWithBackground';
import AdminEditButton from '@/components/admin/AdminEditButton';

export interface YesNoAssessmentQuestion {
  id: string;
  text: string;
}

export interface YesNoScoreBand {
  range: [number, number];
  label: string;
  description?: string;
}

interface SelfCheckYesNoAssessmentProps {
  chapterId: number;
  chapterSlug: string;
  questions: YesNoAssessmentQuestion[];
  scoreBands?: YesNoScoreBand[];
  nextStepUrl: string;
  questionsStepTitle: string;
  questionsStepSubtitle: string;
  hasCompletedBefore?: boolean;
  onSaveAnswers?: (
    answers: Record<string, 'yes' | 'no' | 'not_sure'>,
    yesCount: number
  ) => Promise<{ success: boolean; error?: string }>;
  adminEditChapterId?: string;
  adminEditPageId?: string;
  adminEditStepId?: string;
  adminEditReturnUrl?: string;
}

type YesNoValue = 'yes' | 'no' | 'not_sure';

export default function SelfCheckYesNoAssessment({
  chapterId,
  chapterSlug,
  questions,
  scoreBands,
  nextStepUrl,
  questionsStepTitle,
  questionsStepSubtitle,
  hasCompletedBefore = false,
  onSaveAnswers,
  adminEditChapterId,
  adminEditPageId,
  adminEditStepId,
  adminEditReturnUrl,
}: SelfCheckYesNoAssessmentProps) {
  const _unused = { chapterId, chapterSlug };
  const router = useRouter();
  const [showRetryModal, setShowRetryModal] = useState(hasCompletedBefore);
  const [step, setStep] = useState<'intro' | 'questions' | 'results'>('intro');
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, YesNoValue>>({});
  const [saving, setSaving] = useState(false);

  // Dynamic copy from admin
  const [copy, setCopy] = useState(() => ({
    introTitle: 'Self-Check',
    introSubtitle: 'Take a quick snapshot of where you are in this chapter.',
    introBody1:
      'This check is just for you. Answer based on how things feel right now, not how you wish they were.',
    introBody2:
      "It's not a test or a grade. It's a baseline for this chapter so you can see your progress as you move through the lessons.",
    highlightTitle: `You'll answer ${questions.length} statements with Yes, No, or Not Sure.`,
    highlightBody: "Takes about a minute. Your score shows which zone you're in and what to focus on next.",
    questionsTitle: questionsStepTitle,
    questionsSubtitle: questionsStepSubtitle,
    resultTitle: 'Self-Check Results',
    resultSubtitle: 'This is your starting point for this chapter—not your ending point.',
    resultScoreMessage: '',
    resultScoreBandsTitle: 'Score Bands Explained',
    resultScoreBands: [] as YesNoScoreBand[],
    resultButtonText: 'Continue to Next Step →',
    introStyles: {
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
    resultStyles: {
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
  }));

  useEffect(() => {
    let cancelled = false;

    async function loadCopy() {
      try {
        const res = await fetch(`/api/chapter/${chapterId}/self-check-copy`);
        if (!res.ok) return;
        const json = await res.json();
        if (!json?.success) return;

        if (cancelled) return;

        const intro = json.intro as any;
        const result = json.result as any;

        setCopy((prev) => ({
          introTitle: intro?.title || prev.introTitle,
          introSubtitle: intro?.subtitle || prev.introSubtitle,
          introBody1: intro?.body1 || prev.introBody1,
          introBody2: intro?.body2 || prev.introBody2,
          highlightTitle: intro?.highlightTitle || prev.highlightTitle,
          highlightBody: intro?.highlightBody || prev.highlightBody,
          questionsTitle: intro?.questionsTitle || prev.questionsTitle,
          questionsSubtitle: intro?.questionsSubtitle || prev.questionsSubtitle,
          resultTitle: result?.title || prev.resultTitle,
          resultSubtitle: result?.subtitle || prev.resultSubtitle,
          resultScoreMessage: result?.scoreMessage || prev.resultScoreMessage,
          resultScoreBandsTitle: result?.scoreBandsTitle || prev.resultScoreBandsTitle,
          resultScoreBands: Array.isArray(result?.scoreBands)
            ? result.scoreBands
                .map((b: any) => {
                  let range: [number, number] | null = null;
                  if (Array.isArray(b?.range) && b.range.length === 2) {
                    range = [Number(b.range[0]), Number(b.range[1])];
                  } else if (typeof b?.range === 'string') {
                    const text = b.range.trim();
                    const plus = text.match(/^(\d+)\+$/);
                    if (plus) {
                      const min = Number(plus[1]);
                      range = [min, questions.length];
                    } else {
                      const dash = text.match(/^(\d+)\s*-\s*(\d+)$/);
                      if (dash) {
                        range = [Number(dash[1]), Number(dash[2])];
                      } else {
                        const single = text.match(/^(\d+)$/);
                        if (single) {
                          const n = Number(single[1]);
                          range = [n, n];
                        }
                      }
                    }
                  }
                  if (!range || !Number.isFinite(range[0]) || !Number.isFinite(range[1])) return null;
                  return {
                    range,
                    label: String(b?.label || ''),
                    description: b?.description ? String(b.description) : undefined,
                  };
                })
                .filter(Boolean) as YesNoScoreBand[]
            : prev.resultScoreBands,
          resultButtonText: result?.buttonText || prev.resultButtonText,
          introStyles: {
            ...prev.introStyles,
            ...(intro?.styles || {}),
          },
          resultStyles: {
            ...prev.resultStyles,
            ...(result?.styles || {}),
          },
        }));
      } catch (error) {
        console.error('[SelfCheckYesNo] Failed to load copy:', error);
      }
    }

    loadCopy();
    return () => {
      cancelled = true;
    };
  }, [chapterId, questions.length]);

  const questionsPerPage = 3;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const currentPageQuestions = currentQuestions.map(q => q.id);
  const allCurrentAnswered = currentPageQuestions.every(id => answers[id] !== undefined);

  const yesCount = Object.values(answers).filter(v => v === 'yes').length;
  const effectiveScoreBands =
    Array.isArray(scoreBands) && scoreBands.length > 0
      ? scoreBands
      : copy.resultScoreBands;
  const isBandMode = !!(effectiveScoreBands && effectiveScoreBands.length > 0);

  const getScoreBand = () => {
    if (!effectiveScoreBands || effectiveScoreBands.length === 0) return null;
    return effectiveScoreBands.find(band => yesCount >= band.range[0] && yesCount <= band.range[1]);
  };

  const scoreBand = getScoreBand();

  const handleAnswer = (questionId: string, value: YesNoValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextPage = async () => {
    if (!allCurrentAnswered) return;

    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      return;
    }

    // All questions answered, save and show results
    setSaving(true);
    try {
      if (onSaveAnswers) {
        await onSaveAnswers(answers, yesCount);
      }
    } catch (error) {
      console.error('[SelfCheckYesNo] Failed to save answers before results:', error);
      // Still show the results screen so user flow is not blocked by transient save errors.
    } finally {
      setSaving(false);
      setStep('results');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // RETRY MODAL
  if (showRetryModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-black text-[#111827] dark:text-white mb-3">
            Already Completed
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            You've already completed this self-check. Do you want to retake it and update your baseline score?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setShowRetryModal(false);
                setStep('intro');
              }}
              className="w-full rounded-xl bg-[#f7b418] hover:bg-[#e5a309] px-6 py-3 text-base font-bold text-black transition-colors"
            >
              Yes, Retake Self-Check
            </button>
            <button
              onClick={() => router.push(nextStepUrl)}
              className="w-full rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-200 transition-colors"
            >
              Skip to Next Step →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // INTRO SCREEN
  if (step === 'intro') {
    return (
      <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300" style={{ height: '100dvh' }}>
        <DashboardNav />
        <MainWithBackground>
          <div className="mx-auto max-w-[980px] px-6 py-12 lg:py-16">
            <h1 
              className="self-check-intro-heading font-black mb-3"
              style={{ 
                color: copy.introStyles.titleColor,
                fontSize: copy.introStyles.titleSize === '5xl' ? '3rem' : 
                         copy.introStyles.titleSize === '4xl' ? '2.25rem' :
                         copy.introStyles.titleSize === '3xl' ? '1.875rem' : '3rem'
              }}
            >
              {copy.introTitle}
            </h1>
            <h2 
              className="text-2xl mb-10"
              style={{ color: copy.introStyles.subtitleColor }}
            >
              {copy.introSubtitle}
            </h2>

            <div 
              className="self-check-intro-card rounded-2xl p-8 shadow-sm mb-8 space-y-6"
              style={{ 
                backgroundColor: copy.introStyles.bodyBgColor,
                color: copy.introStyles.bodyTextColor
              }}
            >
              <p className="text-lg leading-relaxed">
                {copy.introBody1}
              </p>
              <p className="text-lg leading-relaxed">
                {copy.introBody2}
              </p>

              <div 
                className="self-check-intro-highlight p-6 rounded-xl"
                style={{
                  backgroundColor: copy.introStyles.highlightBgColor,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: copy.introStyles.highlightBorderColor,
                  color: copy.introStyles.highlightTextColor
                }}
              >
                <p className="font-bold text-lg mb-2">
                  {copy.highlightTitle}
                </p>
                <p>
                  {copy.highlightBody}
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('questions')}
              className="w-full rounded-xl px-8 py-4 text-lg font-bold shadow-lg transition-all"
              style={{ 
                backgroundColor: copy.introStyles.buttonBgColor,
                color: copy.introStyles.buttonTextColor
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = copy.introStyles.buttonHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = copy.introStyles.buttonBgColor;
              }}
            >
              Start Self-Check →
            </button>
            {adminEditChapterId && adminEditPageId ? (
              <div className="mt-3 flex justify-center">
                <AdminEditButton
                  chapterId={adminEditChapterId}
                  pageId={adminEditPageId}
                  stepId={adminEditStepId}
                  returnUrl={adminEditReturnUrl}
                />
              </div>
            ) : null}
          </div>
        </MainWithBackground>
      </div>
    );
  }

  // RESULTS SCREEN
  if (step === 'results') {
    return (
      <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300 overflow-hidden" style={{ height: '100dvh' }}>
        <DashboardNav />
        <MainWithBackground>
          <div className="mx-auto flex h-full max-w-[980px] flex-col px-6 py-8 lg:py-10">
            <h1 
              className="self-check-result-heading text-4xl font-black mb-1"
              style={{ color: copy.resultStyles.titleColor }}
            >
              {copy.resultTitle}
            </h1>
            <p 
              className="text-lg mb-6"
              style={{ color: copy.resultStyles.subtitleColor }}
            >
              {copy.resultSubtitle}
            </p>

            <div 
              className="self-check-result-score-box rounded-2xl p-8 shadow-sm mb-4 text-center"
              style={{ 
                backgroundColor: copy.resultStyles.scoreBgColor,
                color: copy.resultStyles.scoreTextColor
              }}
            >
              {isBandMode ? (
                <>
                  <div className="self-check-result-score text-7xl font-black mb-2 dark:!text-[#111111]">
                    {yesCount}
                  </div>
                  <p className="self-check-result-outof text-sm mb-6 dark:!text-[#111111] dark:!opacity-100" style={{ opacity: 0.7 }}>
                    out of {questions.length} (Yes responses)
                  </p>

                  {scoreBand && (
                    <>
                      <div 
                        className="self-check-result-badge inline-block px-8 py-3 rounded-full text-white font-bold text-lg mb-4"
                        style={{ backgroundColor: '#f7b418' }}
                      >
                        {scoreBand.label}
                      </div>

                      {scoreBand.description && (
                        <p className="self-check-result-message mt-4 text-lg">
                          {scoreBand.description}
                        </p>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="py-4">
                  <div 
                    className="self-check-result-badge inline-block px-8 py-3 rounded-full text-white font-bold text-lg mb-4"
                    style={{ backgroundColor: '#f7b418' }}
                  >
                    {copy.resultTitle}
                  </div>
                  <p className="self-check-result-message mt-4 text-lg">
                    {copy.resultScoreMessage || copy.resultSubtitle}
                  </p>
                </div>
              )}
            </div>

            {isBandMode && (
              <div 
                className="self-check-result-expl-box rounded-2xl p-6 mb-4 flex-1 overflow-auto"
                style={{ 
                  backgroundColor: copy.resultStyles.explanationBgColor,
                  color: copy.resultStyles.explanationTextColor
                }}
              >
                <h3 className="text-2xl font-black mb-4">
                  {copy.resultScoreBandsTitle}
                </h3>
                <div className="space-y-3">
                  {effectiveScoreBands.map((band, idx) => (
                    <div key={idx} className="flex gap-4">
                      <span className="font-bold w-24">
                        {band.range[0]}-{band.range[1]}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold">{band.label}</p>
                        {band.description && (
                          <p className="text-sm opacity-80">{band.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => router.push(nextStepUrl)}
              className="mt-2 w-full rounded-xl px-6 py-3 text-lg font-bold shadow-lg transition-all"
              style={{ 
                backgroundColor: copy.resultStyles.buttonBgColor,
                color: copy.resultStyles.buttonTextColor
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = copy.resultStyles.buttonHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = copy.resultStyles.buttonBgColor;
              }}
            >
              {copy.resultButtonText}
            </button>
            {adminEditChapterId && adminEditPageId ? (
              <div className="mt-3 flex justify-center">
                <AdminEditButton
                  chapterId={adminEditChapterId}
                  pageId={adminEditPageId}
                  stepId={adminEditStepId}
                  returnUrl={adminEditReturnUrl}
                />
              </div>
            ) : null}
          </div>
        </MainWithBackground>
      </div>
    );
  }

  // QUESTIONS SCREEN
  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-[#142A4A] transition-colors duration-300" style={{ height: '100dvh' }}>
      <DashboardNav />
      <MainWithBackground>
        <div className="mx-auto max-w-[980px] px-6 py-6 lg:py-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[42px] leading-[1.05] font-extrabold text-[#111827] dark:text-white">
                {copy.questionsTitle}
              </h1>
              <p className="mt-1 text-[18px] text-gray-600 dark:text-gray-300">
                {copy.questionsSubtitle}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Questions {currentPage * questionsPerPage + 1}-{Math.min((currentPage + 1) * questionsPerPage, questions.length)} of {questions.length}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <span
                  key={i}
                  className={`inline-block h-2 rounded-full transition-all ${
                    i === currentPage ? 'w-5 bg-[#f7b418]' : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {currentQuestions.map((q, idx) => (
              <YesNoQuestionCard
                key={q.id}
                number={currentPage * questionsPerPage + idx + 1}
                question={q.text}
                value={answers[q.id]}
                onChange={(val) => handleAnswer(q.id, val)}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="rounded-xl bg-gray-200 px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-700 dark:text-gray-100"
            >
              ← Back
            </button>
            <button
              onClick={handleNextPage}
              disabled={!allCurrentAnswered || saving}
              className="flex-1 rounded-xl bg-[#f7b418] px-8 py-3 text-sm font-bold text-black hover:bg-[#e5a309] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {currentPage === totalPages - 1 ? (saving ? 'Saving...' : 'Complete Self-Check →') : 'Next →'}
            </button>
            {adminEditChapterId && adminEditPageId ? (
              <AdminEditButton
                chapterId={adminEditChapterId}
                pageId={adminEditPageId}
                stepId={adminEditStepId}
                returnUrl={adminEditReturnUrl}
              />
            ) : null}
          </div>
        </div>
      </MainWithBackground>
    </div>
  );
}

interface YesNoQuestionCardProps {
  number: number;
  question: string;
  value?: YesNoValue;
  onChange: (value: YesNoValue) => void;
}

function YesNoQuestionCard({ number, question, value, onChange }: YesNoQuestionCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#f7b418] text-base font-bold text-black">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl leading-tight font-bold text-[#111827] dark:text-white">
            {question}
          </h3>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
        <div className="flex gap-3">
          <button
            onClick={() => onChange('yes')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-semibold ${
              value === 'yes'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-500 hover:bg-green-50'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => onChange('not_sure')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-semibold ${
              value === 'not_sure'
                ? 'bg-yellow-400 border-yellow-400 text-black'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
            }`}
          >
            Not sure
          </button>
          <button
            onClick={() => onChange('no')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-semibold ${
              value === 'no'
                ? 'bg-red-500 border-red-500 text-white'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-500 hover:bg-red-50'
            }`}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
