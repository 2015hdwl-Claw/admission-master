import CountdownTimer from '@/components/CountdownTimer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Hero */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          高職升學<br />
          <span className="text-indigo-600">從技能出發，以終為始</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
          台灣高職生的升學準備平台。追蹤專題實作、技能檤定、實習和競賽，規劃你的四技二專之路。
        </p>
        <Link
          href="/onboarding/step1"
          className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-xl text-lg font-bold hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
        >
          開始探索我的職群
        </Link>
      </section>

      {/* Countdown */}
      <section className="bg-white rounded-2xl p-8 md:p-12 shadow-sm text-center mb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-2">距離 115 統測還有</h2>
        <p className="text-gray-500 text-sm mb-8">統一入學測驗是四技二專甄選的關鍵，現在開始準備</p>
        <div className="flex justify-center">
          <CountdownTimer />
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-8 md:grid-cols-3 mb-16">
        {[
          {
            icon: '🎯',
            title: '技能旅程追蹤',
            desc: '記錄專題實作、技能檤定、實習、競賽等 7 大技能類別。一鍵轉為備審素材，讓你的技能變成升學優勢。'
          },
          {
            icon: '🗺️',
            title: '職群探索',
            desc: '15 個職群、17 個科別完整介紹，附就業數據和推薦科技大學。從你的技能反推最適合的方向。'
          },
          {
            icon: '🤖',
            title: 'AI 面試模擬',
            desc: '四技二專甄選面試練習。AI 模擬面試官，根據你的職群出題，即時回饋，讓你面試不緊張。'
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
        <h2 className="text-2xl md:text-3xl font-bold mb-4">不知道要選哪個職群？</h2>
        <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
          5 步導入流程，從你已有的技能和經驗出發，推導適合你的職群方向，生成專屬三年路線圖。
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
