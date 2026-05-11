'use client';

const STEP_COLORS = [
  'bg-blue-400',
  'bg-purple-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-orange-400',
  'bg-pink-400',
];

export default function DiscoveryProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gray-200/60">
        <div
          className={`h-full transition-all duration-700 ease-out rounded-r-full ${STEP_COLORS[currentStep]}`}
          style={{ width: `${((currentStep + 1) / 6) * 100}%` }}
        />
      </div>
    </div>
  );
}
