'use client';

import { useState } from 'react';
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
            <h1 className="text-5xl font-black text-[#111827] dark:text-white mb-3">
              YOUR SELF-CHECK
            </h1>
            <h2 className="text-2xl text-gray-500 dark:text-gray-400 mb-10">
              How intense is your speaking anxiety right now?
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm mb-8 space-y-6">
              <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                Before Tony could use VOICE and the techniques, he needed an honest snapshot of where he stood. Not where he wished he was—where he actually was.
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                This isn't a judgment. It's a baseline. Be honest—only you see this. The more accurate you are now, the better your plan will be.
              </p>

              <div className="bg-[#f7b418]/10 dark:bg-[#f7b418]/20 p-6 rounded-xl border border-[#f7b418]/30">
                <p className="text-gray-900 dark:text-white font-bold text-lg mb-2">
                  You'll rate {questions.length} statements from 1 to 7.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Takes about a minute. Your score shows which zone you're in and what to focus on.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('questions')}
              className="w-full rounded-xl bg-[#f7b418] hover:bg-[#e5a309] px-8 py-4 text-lg font-bold text-black shadow-lg transition-colors"
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
            <h1 className="text-4xl font-black text-[#111827] dark:text-white mb-1">
              Your Baseline Score
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
              This is your starting point—not your ending point.
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm mb-4 text-center">
              <div className="text-7xl font-black text-[#111827] dark:text-white mb-2">
                {totalScore}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                out of {maxScore}
              </p>

              <div 
                className="inline-block px-8 py-3 rounded-full text-white font-bold text-lg"
                style={{ backgroundColor: scoreBand.color }}
              >
                {scoreBand.band}
              </div>

              <p className="mt-6 text-lg text-gray-700 dark:text-gray-300">
                {scoreBand.message}
              </p>
            </div>

            <div className="bg-[#fef3c7] dark:bg-[#78350f]/20 rounded-2xl p-6 mb-4 flex-1 overflow-auto">
              <h3 className="text-2xl font-black text-[#111827] dark:text-white mb-4">
                Score Bands Explained
              </h3>
              <div className="space-y-3">
                {scoreBandsExplained.map((band, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="font-bold text-gray-900 dark:text-white w-24">
                      {band.range}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {band.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push(nextStepUrl)}
              className="mt-2 w-full rounded-xl bg-[#ff6a38] hover:bg-[#e55a28] px-6 py-3 text-lg font-bold text-white shadow-lg transition-colors"
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
