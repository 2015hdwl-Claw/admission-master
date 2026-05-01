import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '升學指南 | 申請入學策略、備審攻略、面試技巧 - 升學大師',
  description: '完整的申請入學指南，包含備審寫作技巧、面試準備策略、科系探索分析，幫助學生成功申請理想大學。',
  keywords: '申請入學,備審書,面試技巧,科系探索,升學策略,大學申請',
  openGraph: {
    title: '升學指南 | 升學大師',
    description: '完整的申請入學指南，幫助學生成功申請理想大學',
    type: 'website',
  },
};

export default function GuidePage() {
  const guides = [
    {
      title: '備審書寫作指南',
      slug: 'portfolio-writing',
      description: '從結構到內容，完整的備審書寫作技巧',
      icon: '📝'
    },
    {
      title: '面試準備攻略',
      slug: 'interview-prep',
      description: '常見面試問題、回答技巧、模擬面試',
      icon: '🎯'
    },
    {
      title: '科系探索分析',
      slug: 'department-exploration',
      description: '各大學科系特色、就業方向、申請策略',
      icon: '🔍'
    },
    {
      title: '申請時程規劃',
      slug: 'application-timeline',
      description: '高三申請入學完整時間表與重要節點',
      icon: '📅'
    },
    {
      title: '學習歷程中心',
      slug: 'learning-journey',
      description: '如何整理與呈現你的學習歷程',
      icon: '🎓'
    },
    {
      title: '多元表現紀錄',
      slug: 'diverse-performance',
      description: '競賽、證書、專題如何加分',
      icon: '🏆'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            申請入學完整指南
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            系統化準備，讓你的申請入學之路更順暢
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/analyze"
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              開始分析
            </Link>
            <Link
              href="/explore"
              className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50 transition-colors border-2 border-indigo-600"
            >
              探索科系
            </Link>
          </div>
        </div>

        {/* Guide Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guide/${guide.slug}`}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <div className="text-4xl mb-4">{guide.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {guide.title}
              </h3>
              <p className="text-gray-600">{guide.description}</p>
            </Link>
          ))}
        </div>

        {/* SEO Content */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            為什麼選擇升學大師？
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              申請入學是台灣學生進入理想大學的重要管道，但許多學生和家长對於如何準備備審書、面試技巧、科系選擇等問題感到困惑。升學大師提供專業的分析工具和完整的指南，幫助你系統化準備申請入學。
            </p>
            
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">
              我們的特色功能
            </h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>AI 備審分析：</strong>先進的 AI 技術分析你的備審書內容，提供改進建議</li>
              <li><strong>科系探索工具：</strong>深入了解各大學科系特色，找到最適合你的方向</li>
              <li><strong>面試準備系統：</strong>模擬面試題庫，讓你提前準備常見問題</li>
              <li><strong>學習歷程整理：</strong>系統化記錄你的學習歷程和多元表現</li>
              <li><strong>申請策略分析：</strong>根據你的條件，提供最適合的申請策略</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">
              申請入學成功要點
            </h3>
            <p>
              成功的申請入學需要充分的準備和策略。從高一開始累積多元表現，高二深入探索科系，高三精心準備備審書和面試。升學大師陪伴你整個申請過程，提供專業的分析和建議。
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            準備開始你的申請入學之旅？
          </h2>
          <p className="mb-6 text-indigo-100">
            立即註冊升學大師，獲得專業的申請分析和策略建議
          </p>
          <Link
            href="/analyze"
            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            免費開始分析
          </Link>
        </div>
      </div>
    </div>
  );
}
