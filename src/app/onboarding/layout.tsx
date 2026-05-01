'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const STEPS = [
  { path: '/onboarding/step1', label: '你在哪' },
  { path: '/onboarding/step2', label: '事實盤點' },
  { path: '/onboarding/step3', label: '方向推導' },
  { path: '/onboarding/step4', label: '探索方向' },
  { path: '/onboarding/step5', label: '確認方向' },
];

function getStepIndex(pathname: string): number {
  const match = pathname.match(/step(\d)/);
  return match ? parseInt(match[1], 10) - 1 : 0;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentIndex = getStepIndex(pathname);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-primary-fixed to-white">
      {/* Progress bar */}
      <div className="bg-white border-b border-[#E9E5DB] sticky top-14 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => {
              const isCompleted = i < currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={step.path} className="flex items-center flex-1">
                  <Link
                    href={step.path}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors min-w-0 ${
                      isCompleted
                        ? 'text-primary'
                        : isCurrent
                        ? 'text-primary'
                        : 'text-outline'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : isCurrent
                          ? 'bg-primary-100 text-primary ring-2 ring-primary-600'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      {isCompleted ? '✓' : i + 1}
                    </span>
                    <span className="hidden sm:inline truncate">{step.label}</span>
                  </Link>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded-full ${
                        i < currentIndex ? 'bg-primary' : 'bg-surface-container-high'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {children}
      </div>
    </div>
  );
}
