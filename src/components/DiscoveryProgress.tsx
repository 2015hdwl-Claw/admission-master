'use client';

import React from 'react';

interface DiscoveryProgressProps {
  currentStep: number;
  totalSteps?: number;
}

const steps = [
  { id: 0, label: '搜尋學校' },
  { id: 1, label: '選擇學群' },
  { id: 2, label: '選擇學程' },
  { id: 3, label: '填寫成績' },
  { id: 4, label: '分析結果' },
  { id: 5, label: '完成' },
];

export default function DiscoveryProgress({ currentStep, totalSteps = 6 }: DiscoveryProgressProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Bar Background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />

        {/* Progress Bar Fill */}
        <div
          className="absolute top-5 left-0 h-1 bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />

        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-300 ${
                step.id < currentStep
                  ? 'bg-blue-600 text-white'
                  : step.id === currentStep
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.id < currentStep ? '✓' : step.id + 1}
            </div>
            <span className={`mt-2 text-xs font-medium ${
              step.id <= currentStep ? 'text-blue-700' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
