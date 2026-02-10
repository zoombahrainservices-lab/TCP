'use client';

import { ReactNode } from 'react';
import Image from 'next/image';

interface SectionLayoutProps {
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  imagePosition?: 'left' | 'right';
  contentBgColor?: string;
}

export default function SectionLayout({
  imageSrc,
  imageAlt,
  children,
  imagePosition = 'left',
  contentBgColor = 'bg-[#FFF8E7] dark:bg-[#2A2416]',
}: SectionLayoutProps) {
  const imageSection = (
    <div className="w-full lg:w-1/2 min-w-0 h-64 sm:h-96 lg:h-full lg:min-h-[400px] flex-shrink-0 relative overflow-hidden">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
    </div>
  );

  const contentSection = (
    <div className={`w-full lg:w-1/2 min-w-0 flex-shrink-0 ${contentBgColor} flex flex-col`}>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8 lg:p-12">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full w-full flex flex-col lg:flex-row lg:h-full">
      {imagePosition === 'left' ? (
        <>
          {imageSection}
          {contentSection}
        </>
      ) : (
        <>
          {contentSection}
          {imageSection}
        </>
      )}
    </div>
  );
}
