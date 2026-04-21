import Link from 'next/link';

const PLANS = [
  {
    name: '免費版',
    price: '免費',
    period: '',
    description: '適合開始探索的高中生',
    features: [
      '學測分數分析',
      '5 步導入流程',
      '方向推導（規則引擎）',
      '個人化路線圖',
      '校曆同步',
      '素材記錄（基本）',
      '成就時光軸',
    ],
    cta: '目前使用中',
    highlighted: false,
    disabled: true,
  },
  {
    name: '升學大師 Pro',
    price: 'NT$1,990',
    period: '/ 季',
    description: '全方位升學準備，不再錯過任何機會',
    features: [
      '免費版所有功能',
      'AI 深度方向分析',
      '備審資料撰寫輔助',
      '面試題庫 + 模擬面試',
      '缺口分析 + 個人化建議',
      '家長週報（完整版）',
      '科系比較工具',
      '優先客服支援',
    ],
    cta: '升級 Pro',
    highlighted: true,
    disabled: false,
  },
  {
    name: '升學大師 Family',
    price: 'NT$2,990',
    period: '/ 季',
    description: '家庭方案，家長和孩子一起掌握進度',
    features: [
      'Pro 版所有功能',
      '最多 3 位學生帳號',
      '家長 Dashboard',
      '每週進度報告',
      '升學諮詢預約（每月 1 次）',
      '學習資源庫完整存取',
      '兄弟姊妹折扣',
    ],
    cta: '選擇 Family',
    highlighted: false,
    disabled: false,
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          選擇你的升學方案
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          免費版已經可以完成完整的導入和路線圖規劃。
          Pro 和 Family 版提供更深度的分析和輔助功能。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={`rounded-2xl p-6 flex flex-col ${
              plan.highlighted
                ? 'bg-white border-2 border-indigo-600 shadow-lg relative'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                最受歡迎
              </div>
            )}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              {plan.period && (
                <span className="text-gray-500 text-sm">{plan.period}</span>
              )}
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-indigo-500 mt-0.5 flex-shrink-0">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              disabled={plan.disabled}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                plan.highlighted
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                  : plan.disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">常見問題</h2>
        <div className="space-y-4">
          {[
            {
              q: '免費版真的夠用嗎？',
              a: '免費版包含完整的 5 步導入流程、方向推導引擎和個人化路線圖。對於大部分高中生來說，免費版已經可以幫助你找到方向並規劃升學路。',
            },
            {
              q: '可以隨時取消訂閱嗎？',
              a: '可以，隨時取消，不會自動續扣。取消後帳號會在當期結束後降級為免費版，你的所有資料都會保留。',
            },
            {
              q: 'AI 分析比規則引擎好在哪裡？',
              a: '規則引擎基於固定規則匹配，AI 分析可以更細緻地理解你的獨特背景，給出更具個人化的建議。例如 AI 可以分析你的素材內容品質，而不只是數量。',
            },
            {
              q: 'Family 方案可以加人嗎？',
              a: '可以，最多支援 3 位學生帳號。如果你有超過 3 位孩子需要升學準備，請聯繫客服。',
            },
          ].map(faq => (
            <div key={faq.q} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-500 text-sm mb-4">
          不確定哪個方案適合你？先從免費版開始。
        </p>
        <Link
          href="/onboarding/step1"
          className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-xl text-lg font-bold hover:bg-indigo-700 shadow-lg transition-all"
        >
          免費開始
        </Link>
      </div>
    </div>
  );
}
