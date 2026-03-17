'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardNav } from '@/components/ui/DashboardNav';
import { MainWithBackground } from '@/components/dashboard/MainWithBackground';

export interface AssessmentQuestion {
  id: number;
  question: string;
  low: string;
  high: string;
}

interface SelfCheckAssessmentProps {
  chapterId: number;
  chapterSlug: string;
  questions: AssessmentQuestion[];
  nextStepUrl: string;
  questionsStepTitle: string;
  questionsStepSubtitle: string;
  hasCompletedBefore?: boolean;
  onSaveAnswers?: (answers: Record<number, number>, totalScore: number) => Promise<{ success: boolean; error?: string }>;
}

export default function SelfCheckAssessment({
  chapterId,
  chapterSlug,
  questions,
  nextStepUrl,
  questionsStepTitle,
  questionsStepSubtitle,
  hasCompletedBefore = false,
  onSaveAnswers,
}: SelfCheckAssessmentProps) {
  const router = useRouter();
  const [showRetryModal, setShowRetryModal] = useState(hasCompletedBefore);
  const [step, setStep] = useState<'intro' | 'questions' | 'results'>('intro');
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const questionsPerPage = 3;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextPage = async () => {
    const currentPageQuestions = currentQuestions.map(q => q.id);
    const allAnswered = currentPageQuestions.every(id => answers[id] !== undefined);

    if (!allAnswered) return;

    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      // All questions answered, save and show results
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      if (onSaveAnswers) {
        await onSaveAnswers(answers, totalScore);
      }
      setStep('results');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const currentPageQuestions = currentQuestions.map(q => q.id);
  const allCurrentAnswered = currentPageQuestions.every(id => answers[id] !== undefined);

  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const maxScore = questions.length * 7;

  // ---------------------------------------------------------------------------
  // Dynamic intro/results copy per chapter (admin-controlled)
  // ---------------------------------------------------------------------------
  const [copy, setCopy] = useState(() => ({
    introTitle: 'Self-Check',
    introSubtitle: 'Take a quick snapshot of where you are in this chapter.',
    introBody1:
      'This check is just for you. Answer based on how things feel right now, not how you wish they were.',
    introBody2:
      "It's not a test or a grade. It's a baseline for this chapter so you can see your progress as you move through the lessons.",
    highlightTitle: `You'll rate ${questions.length} statements from 1 to 7.`,
    highlightBody: "Takes about a minute. Your score shows which zone you're in and what to focus on next.",
    resultTitle: 'Self-Check Results',
    resultSubtitle: 'This is your starting point for this chapter—not your ending point.',
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
          resultTitle: result?.title || prev.resultTitle,
          resultSubtitle: result?.subtitle || prev.resultSubtitle,
          introStyles: {
            ...prev.introStyles,
            ...(intro?.styles || {}),
          },
          resultStyles: {
            ...prev.resultStyles,
            ...(result?.styles || {}),
          },
        }));
      } catch {
        // ignore, fall back to defaults
      }
    }

    loadCopy();
    return () => {
      cancelled = true;
    };
  }, [chapterId, questions.length]);

  // Score band logic
  const getScoreBand = () => {
    const percent = (totalScore / maxScore) * 100;
    if (percent >= 75) return {
      band: "You're managing it",
      color: '#16a34a',
      message: 'Keep building experience and reps.',
    };
    if (percent >= 50) return {
      band: 'Moderate anxiety',
      color: '#f7b418',
      message: 'Focus on Techniques #1 and #3.',
    };
    if (percent >= 25) return {
      band: "You're where Tony started",
      color: '#dc2626',
      message: 'VOICE framework will help the most here.',
    };
    return {
      band: 'Low anxiety',
      color: '#0073ba',
      message: "You're doing well. Keep practicing to stay confident.",
    };
  };

  const scoreBand = getScoreBand();

  const scoreBandsExplained = [
    { range: `${Math.ceil(maxScore * 0.75)}-${maxScore}`, description: "You're managing it. Keep building experience." },
    { range: `${Math.ceil(maxScore * 0.5)}-${Math.ceil(maxScore * 0.75) - 1}`, description: 'Moderate anxiety. Focus on Techniques #1 and #3.' },
    { range: `${Math.ceil(maxScore * 0.25)}-${Math.ceil(maxScore * 0.5) - 1}`, description: "You're where Tony started. VOICE framework will help the most." },
    { range: `1-${Math.ceil(maxScore * 0.25) - 1}`, description: 'Low anxiety. Keep practicing to stay confident.' },
  ];

  // RETRY MODAL (if user already completed)
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
              className="font-black mb-3"
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
              className="rounded-2xl p-8 shadow-sm mb-8 space-y-6"
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
                className="p-6 rounded-xl"
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
              className="text-4xl font-black mb-1"
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
              className="rounded-2xl p-8 shadow-sm mb-4 text-center"
              style={{ 
                backgroundColor: copy.resultStyles.scoreBgColor,
                color: copy.resultStyles.scoreTextColor
              }}
            >
              <div className="text-7xl font-black mb-2">
                {totalScore}
              </div>
              <p className="text-sm mb-6" style={{ opacity: 0.7 }}>
                out of {maxScore}
              </p>

              <div 
                className="inline-block px-8 py-3 rounded-full text-white font-bold text-lg"
                style={{ backgroundColor: scoreBand.color }}
              >
                {scoreBand.band}
              </div>

              <p className="mt-6 text-lg">
                {scoreBand.message}
              </p>
            </div>

            <div 
              className="rounded-2xl p-6 mb-4 flex-1 overflow-auto"
              style={{ 
                backgroundColor: copy.resultStyles.explanationBgColor,
                color: copy.resultStyles.explanationTextColor
              }}
            >
              <h3 className="text-2xl font-black mb-4">
                Score Bands Explained
              </h3>
              <div className="space-y-3">
                {scoreBandsExplained.map((band, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="font-bold w-24">
                      {band.range}
                    </span>
                    <span>
                      {band.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

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
              Continue to Framework →
            </button>
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
                {questionsStepTitle}
              </h1>
              <p className="mt-1 text-[18px] text-gray-600 dark:text-gray-300">
                {questionsStepSubtitle}
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

          <div className="space-y-3">
            {currentQuestions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                number={currentPage * questionsPerPage + idx + 1}
                question={q.question}
                lowLabel={q.low}
                highLabel={q.high}
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
              disabled={!allCurrentAnswered}
              className="flex-1 rounded-xl bg-[#f7b418] px-8 py-3 text-sm font-bold text-black hover:bg-[#e5a309] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      </MainWithBackground>
    </div>
  );
}

interface QuestionCardProps {
  number: number;
  question: string;
  lowLabel: string;
  highLabel: string;
  value?: number;
  onChange: (value: number) => void;
}

function QuestionCard({ number, question, lowLabel, highLabel, value, onChange }: QuestionCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-5 flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#f7b418] text-base font-bold text-black">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl leading-tight font-bold text-[#111827] dark:text-white">
            {question}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            1 = {lowLabel} · 7 = {highLabel}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
        <input
          type="range"
          min="1"
          max="7"
          value={value ?? 4}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="h-3 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#f7b418]"
          style={{
            background: (() => {
              if (value === undefined) {
                return '#e5e7eb';
              }
              const v = value;
              const percent = ((v - 1) / 6) * 100;
              return `linear-gradient(to right, #f7b418 0%, #f7b418 ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`;
            })(),
          }}
        />
        <div className="mt-2 flex justify-between px-1 text-sm font-medium text-gray-500 dark:text-gray-400">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <span
              key={num}
              className={
                value === num
                  ? 'text-[#f7b418] font-bold'
                  : 'text-gray-500 dark:text-gray-400'
              }
            >
              {num}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
