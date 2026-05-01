import Link from 'next/link';
import { ADMISSION_PATHWAYS } from '@/data/admission';

export default function PathwaysPage() {
  return (
    <div className="page-container">
      {/* Header */}
      <section className="mb-xl">
        <div className="border-l-4 border-primary pl-lg py-sm">
          <span className="font-label-caps text-primary uppercase tracking-widest block mb-xs">ADMISSION PATHWAYS</span>
          <h1 className="font-h1 text-h1 text-on-surface">升學管道</h1>
        </div>
        <p className="font-body-lg text-on-surface-variant mt-sm max-w-[42rem]">
          了解台灣大學升學的各種管道，找到最適合你的路。
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
        {ADMISSION_PATHWAYS.map(p => (
          <Link
            key={p.slug}
            href={`/pathways/${p.slug}`}
            className="bg-surface-container-low border border-[#E9E5DB] p-xl hover:border-primary/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-md">
              <span className="text-xs px-2.5 py-1 bg-primary-fixed text-primary font-medium">
                {p.category}
              </span>
              <span className="text-xs text-secondary font-label-caps">佔名額 ~{p.quotaPercentage}%</span>
            </div>
            <h2 className="font-body-lg font-semibold text-on-surface mb-sm group-hover:text-primary transition-colors">{p.name}</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-md">{p.description}</p>
            <div className="text-xs text-on-surface-variant">
              適合：{p.targetStudents}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
