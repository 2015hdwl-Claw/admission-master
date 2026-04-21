import CountdownTimer from '@/components/CountdownTimer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Hero */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          把你正在做的事<br />
          <span className="text-indigo-600">連結到你的未來</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
          台灣高中生的升學準備連結器。透過事實盤點推導你的升學方向，生成專屬路線圖，讓升學路不再迷茫。
        </p>
        <Link
          href="/onboarding/step1"
          className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-xl text-lg font-bold hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
        >
          開始探索我的方向
        </Link>
      </section>

      {/* Countdown */}
      <section className="bg-white rounded-2xl p-8 md:p-12 shadow-sm text-center mb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-2">距離 115 學測還有</h2>
        <p className="text-gray-500 text-sm mb-8">時間不等人，現在開始準備</p>
        <div className="flex justify-center">
          <CountdownTimer />
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-8 md:grid-cols-3 mb-16">
        {[
          {
            icon: '📊',
            title: '免費分數分析',
            desc: '輸入學測級分，立即獲得升學管道推薦和科系建議。完全免費，無需註冊。'
          },
          {
            icon: '🎯',
            title: '繪馬式圖卡',
            desc: '生成專屬升學圖卡，寫下目標，分享到 IG Story，讓朋友一起見證。'
          },
          {
            icon: '🧭',
            title: '升學導航',
            desc: '了解申請入學、繁星推薦、分發入學等管道，找到最適合你的路。'
          }
        ].map(f => (
          <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center py-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">不知道未來要走哪條路？</h2>
        <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
          不知道自己的優勢在哪？5 步導入流程幫你從事實出發，找到適合你的升學方向。
        </p>
        <Link
          href="/onboarding/step1"
          className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl text-lg font-bold hover:bg-indigo-50 transition-colors"
        >
          免費開始
        </Link>
      </section>
    </div>
  );
}
