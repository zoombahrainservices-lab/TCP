'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardNav } from '@/components/ui/DashboardNav';
import { MainWithBackground } from '@/components/dashboard/MainWithBackground';
import LoadingButton from '@/components/ui/LoadingButton';
import AdminEditButton from '@/components/admin/AdminEditButton';

export interface MCQAssessmentQuestion {
  id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId?: string;
}

interface SelfCheckMCQAssessmentProps {
  chapterId: number;
  chapterSlug: string;
  isAdmin?: boolean;
  questions: MCQAssessmentQuestion[];
  nextStepUrl: string;
  questionsStepTitle: string;
  questionsStepSubtitle: string;
  hasCompletedBefore?: boolean;
  onSaveAnswers?: (
    answers: Record<string, string>,
    totalScore: number
  ) => Promise<{ success: boolean; error?: string }>;
  adminEditChapterId?: string;
  adminEditPageId?: string;
  adminEditStepId?: string;
  adminEditReturnUrl?: string;
}

export default function SelfCheckMCQAssessment({
  chapterId,
  chapterSlug,
  isAdmin = false,
  questions,
  nextStepUrl,
  questionsStepTitle,
  questionsStepSubtitle,
  hasCompletedBefore = false,
  onSaveAnswers,
  adminEditChapterId,
  adminEditPageId,
  adminEditStepId,
  adminEditReturnUrl,
}: SelfCheckMCQAssessmentProps) {
  const _unused = { chapterId, chapterSlug };
  const router = useRouter();
  const [showRetryModal, setShowRetryModal] = useState(hasCompletedBefore);
  const [step, setStep] = useState<'questions' | 'results'>('questions');
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Dynamic questions page copy
  const [copy, setCopy] = useState(() => ({
    questionsTitle: questionsStepTitle,
    questionsSubtitle: questionsStepSubtitle,
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

        setCopy((prev) => ({
          questionsTitle: intro?.questionsTitle || prev.questionsTitle,
          questionsSubtitle: intro?.questionsSubtitle || prev.questionsSubtitle,
        }));
      } catch (error) {
        console.error('[SelfCheckMCQ] Failed to load copy:', error);
      }
    }

    loadCopy();

    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  const totalPages = questions.length;
  const currentQuestion = questions[currentPage];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const gradedQuestions = questions.filter((q) => q.correctOptionId);
  const nonGradedQuestions = questions.filter((q) => !q.correctOptionId);
  const correctCount = gradedQuestions.reduce(
    (sum, q) => sum + (answers[q.id] && answers[q.id] === q.correctOptionId ? 1 : 0),
    0
  );
  // "Mark-free" questions get full credit once answered (all are answered at completion flow).
  const markFreeCount = nonGradedQuestions.length;
  const totalScore = correctCount + markFreeCount;

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = async () => {
    if (!currentQuestion || !currentAnswer) return;

    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
      return;
    }

    if (!onSaveAnswers) {
      setStep('results');
      return;
    }

    setSaving(true);
    const result = await onSaveAnswers(answers, totalScore);
    setSaving(false);
    if (result.success) {
      setStep('results');
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  if (showRetryModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-black text-[#111827] dark:text-white mb-3">Already Completed</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            You&apos;ve already completed this self-check. Do you want to retake it and update your answers?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowRetryModal(false)}
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

  if (step === 'results') {
    return (
      <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-[#142A4A]" style={{ height: '100dvh' }}>
        <DashboardNav serverCurrentChapter={chapterId} isAdmin={isAdmin} collapseSidebarByDefault={true} />
        <MainWithBackground>
          <div className="mx-auto max-w-[980px] px-6 py-8 lg:py-10">
            <h1 className="text-4xl font-black text-[#111827] dark:text-white mb-2">Self-Check Complete</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">Your responses are saved.</p>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm mb-6">
              {questions.length > 0 ? (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">Final Score</p>
                  <p className="text-5xl font-black text-[#111827] dark:text-white mb-4">
                    {totalScore} / {questions.length}
                  </p>
                  <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      Total Questions: <span className="font-semibold">{questions.length}</span>
                    </p>
                    <p>
                      Graded Questions (with correct answer):{' '}
                      <span className="font-semibold">{correctCount} / {gradedQuestions.length}</span>
                    </p>
                    <p>
                      Mark-Free Questions (no correct answer):{' '}
                      <span className="font-semibold">{markFreeCount} / {nonGradedQuestions.length}</span>
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-lg text-gray-700 dark:text-gray-200">
                  Thank you. Your reflection answers were submitted.
                </p>
              )}
            </div>

            <button
              onClick={() => router.push(nextStepUrl)}
              className="w-full rounded-xl bg-[#ff6a38] hover:bg-[#e55a28] px-6 py-3 text-lg font-bold text-white shadow-lg transition-colors"
            >
              Continue →
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

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-[#142A4A]" style={{ height: '100dvh' }}>
      <DashboardNav serverCurrentChapter={chapterId} isAdmin={isAdmin} collapseSidebarByDefault={true} />
      <MainWithBackground>
        <div className="mx-auto max-w-[980px] px-6 py-6 lg:py-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[42px] leading-[1.05] font-extrabold text-[#111827] dark:text-white">
                {copy.questionsTitle}
              </h1>
              <p className="mt-1 text-[18px] text-gray-600 dark:text-gray-300">{copy.questionsSubtitle}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Question {currentPage + 1} of {totalPages}
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

          {currentQuestion && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-2xl leading-tight font-bold text-[#111827] dark:text-white mb-5">
                {currentQuestion.question}
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {currentQuestion.correctOptionId
                  ? 'Graded question (correct answer is configured)'
                  : 'Mark-free question (no right/wrong)'}
              </p>

              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const selected = currentAnswer === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(currentQuestion.id, opt.id)}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-colors dark:!text-black ${
                        selected
                          ? 'border-[#f7b418] bg-[#fef3c7] text-[#111827] dark:!text-black'
                          : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:!text-black'
                      }`}
                    >
                      <span className="inline-flex items-center gap-3">
                        <span
                          className={`inline-block h-4 w-4 rounded-full border ${
                            selected ? 'border-[#f7b418] bg-[#f7b418]' : 'border-gray-400'
                          }`}
                        />
                        <span className="dark:!text-black">{opt.text}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="rounded-xl bg-gray-200 px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-700 dark:text-gray-100"
            >
              ← Back
            </button>
            <LoadingButton
              onClick={handleNext}
              disabled={!currentAnswer}
              loading={saving}
              className="flex-1 rounded-xl bg-[#f7b418] px-8 py-3 text-sm font-bold text-black hover:bg-[#e5a309]"
            >
              {currentPage === totalPages - 1 ? 'Complete Self-Check →' : 'Next →'}
            </LoadingButton>
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

