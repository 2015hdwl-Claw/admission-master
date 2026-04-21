import Link from 'next/link';
import { ADMISSION_PATHWAYS } from '@/data/admission';

export default function PathwaysPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">升學管道</h1>
        <p className="text-gray-500">了解台灣大學升學的各種管道，找到最適合你的路</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {ADMISSION_PATHWAYS.map(p => (
          <Link
            key={p.slug}
            href={`/pathways/${p.slug}`}
            className="block bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                {p.category}
              </span>
              <span className="text-xs text-gray-400">佔名額 ~{p.quotaPercentage}%</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{p.name}</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{p.description}</p>
            <div className="text-xs text-gray-400">
              適合：{p.targetStudents}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
