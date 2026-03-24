'use client';

import { SelfCheckResultBlock as SelfCheckResultBlockType } from '@/lib/blocks/types';

interface SelfCheckResultBlockProps extends SelfCheckResultBlockType {
  score?: number;
  maxScore?: number;
  assessmentType?: 'scale' | 'yes_no' | 'mcq';
}

export default function SelfCheckResultBlock({
  title = 'Self-Check Results',
  subtitle = 'This is your starting point for this chapter—not your ending point.',
  scoreBandsTitle = 'Score Bands Explained',
  scoreBands,
  scoreMessage,
  buttonText = 'Continue to Framework →',
  assessmentType = 'scale',
  styles = {},
  score,
  maxScore,
}: SelfCheckResultBlockProps) {
  const stylesExt = styles as typeof styles & {
    explanationBgColor?: string;
    explanationTextColor?: string;
    scoreBandsBgColor?: string;
    scoreBandsTitleColor?: string;
    scoreBandsTextColor?: string;
    buttonBgColor?: string;
    buttonTextColor?: string;
  };
  
  // Default score bands for scale assessments (can be customized)
  const defaultScaleBands = [
    { range: '27-35', label: 'High confidence', explanation: "You're managing it. Keep building experience." },
    { range: '18-26', label: 'Moderate anxiety', explanation: 'Moderate anxiety. Focus on Techniques #1 and #3.' },
    { range: '9-17', label: 'Starting point', explanation: "You're where Tony started. VOICE framework will help the most." },
    { range: '1-8', label: 'Low anxiety', explanation: 'Low anxiety. Keep practicing to stay confident.' },
  ];
  
  // Respect explicit empty score bands from admin.
  // Only use defaults when scoreBands is not provided at all.
  const displayBands = scoreBands ?? (assessmentType === 'scale' ? defaultScaleBands : []);

  return (
    <div className="self-check-result-block w-full">
      {/* This is a configuration block - actual result rendering happens in SelfCheckAssessment components */}
      {/* Admin can customize: title, subtitle, score bands, colors, etc. */}
      
      {/* Preview of configuration in admin panel */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-semibold">
          📊 Self-Check Result Configuration (Assessment Type: {assessmentType})
        </div>
        
        {/* Title Preview */}
        <h3 
          className="text-2xl font-bold mb-2"
          style={{ color: styles.titleColor || '#1f2937' }}
        >
          {title}
        </h3>
        
        {/* Subtitle Preview */}
        {subtitle && (
          <p 
            className="text-base mb-4"
            style={{ color: styles.subtitleColor || '#6b7280' }}
          >
            {subtitle}
          </p>
        )}
        
        {/* Score Message Preview */}
        {scoreMessage && (
          <div 
            className="rounded-lg p-4 mb-4"
            style={{ 
              backgroundColor: stylesExt.explanationBgColor || '#fef3c7',
              color: stylesExt.explanationTextColor || '#92400e'
            }}
          >
            <p className="text-sm">{scoreMessage}</p>
          </div>
        )}
        
        {/* Score Bands Preview */}
        {displayBands.length > 0 && (
          <div 
            className="rounded-lg p-4 mb-4"
            style={{ 
              backgroundColor: stylesExt.scoreBandsBgColor || '#fef3c7',
            }}
          >
            <h4 
              className="font-semibold mb-3"
              style={{ color: stylesExt.scoreBandsTitleColor || '#92400e' }}
            >
              {scoreBandsTitle}
            </h4>
            <div className="space-y-2">
              {displayBands.map((band, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3"
                  style={{ color: stylesExt.scoreBandsTextColor || '#78350f' }}
                >
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <span className="font-mono font-semibold text-sm">
                      {band.range}
                    </span>
                    {band.label && (
                      <span className="text-xs font-medium opacity-90">
                        {band.label}
                      </span>
                    )}
                  </div>
                  <span className="text-sm flex-1">
                    {band.explanation}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Button Preview */}
        <button 
          className="w-full py-3 px-6 rounded-lg font-semibold transition-colors"
          style={{ 
            backgroundColor: stylesExt.buttonBgColor || '#f97316',
            color: stylesExt.buttonTextColor || '#ffffff'
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
