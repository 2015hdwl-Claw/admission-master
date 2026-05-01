'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { activatePro } from '@/lib/subscription';

const PLANS = [
  {
    label: 'ESSENTIAL',
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
    label: 'PROFESSIONAL',
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
    label: 'ULTIMATE',
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

const FAQS = [
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
];

export default function PricingPage() {
  const router = useRouter();
  const [activated, setActivated] = useState<string | null>(null);

  function handleUpgrade(plan: 'pro' | 'family') {
    activatePro(plan);
    setActivated(plan);
    setTimeout(() => router.push('/roadmap'), 800);
  }

  function getButtonLabel(plan: (typeof PLANS)[number]) {
    if (activated === 'pro' && plan.name === '升學大師 Pro') return '已啟用 Pro';
    if (activated === 'family' && plan.name === '升學大師 Family') return '已啟用 Family';
    return plan.cta;
  }

  function isActivated(plan: (typeof PLANS)[number]) {
    return (
      (activated === 'pro' && plan.name === '升學大師 Pro') ||
      (activated === 'family' && plan.name === '升學大師 Family')
    );
  }

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden -mx-[calc((100vw-100%)/2)] w-[calc(100%+100vw-100%)] mb-xxl">
        <div className="absolute inset-0 z-0">
          <img
            alt="Admission Master"
            className="w-full h-full object-cover grayscale-[20%] opacity-90"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfjYe_71WXVfIOPJwSGO3qY72-Qw_DgKKnSQYiDUB_vxutfPCOKS6YFGicGL6Lcy8vtScK36cc7dAIOxVjWtmSUcihTfIB19coKF9DkB3eY3RpJLHO2tdJbcQw7AofwgtM9GcA7dz4mKyUshGkoJo9w6l14kUQ-I4UwmOJUXex9a1umJ50LkAHhgATXcE2xvbPSs_JpyWGQtV7Tuu1sv36UZiL8mOvZAiAJzXT4lRm6hfWKOQX-oQQvh3AlKzIlXkZQ8PhdAg2iFpP"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbf9f7]/70 to-[#fbf9f7]/90" />
        </div>
        <div className="relative z-10 text-center px-8">
          <span className="font-label-caps text-primary tracking-[0.2em] block mb-sm">
            PRICING
          </span>
          <h2 className="font-h1 text-on-background mb-md">
            為您的卓越學術旅程選擇合適方案
          </h2>
          <p className="font-body-lg text-on-surface-variant max-w-[42rem] mx-auto">
            我們結合建築學的嚴謹與教育的溫度，為每一位追求卓越的學子量身打造專屬的升學路徑。
          </p>
        </div>
      </section>

      {/* Pricing Cards Vertical Layout */}
      <div className="flex flex-col gap-lg max-w-[56rem] mx-auto">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={`relative flex flex-col md:flex-row gap-xl items-center p-xl transition-all duration-300 ${
              plan.highlighted
                ? 'bg-white border-2 border-primary shadow-[0_30px_60px_rgba(125,139,126,0.1)] z-10 scale-[1.02]'
                : 'bg-surface-container-low border border-[#E9E5DB] hover:bg-surface-container'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 right-12 -translate-y-1/2 bg-primary px-4 py-1">
                <span className="font-label-caps text-on-primary tracking-widest">最受歡迎選擇</span>
              </div>
            )}

            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-2">
                <span className={`font-label-caps ${plan.highlighted ? 'text-primary' : 'text-secondary'} block`}>{plan.label}</span>
                {plan.highlighted && (
                  <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                )}
              </div>
              <h3 className="font-h2 text-on-background mb-4">{plan.name}</h3>
              <p className="font-body-md text-on-surface-variant mb-6">{plan.description}</p>
              <div className={plan.highlighted ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4' : 'flex flex-wrap gap-x-8 gap-y-4'}>
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span className="font-body-md">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full md:w-48 text-center md:text-right flex-shrink-0">
              <div className="mb-4">
                <span className={`font-serif text-h3 text-on-background block ${plan.highlighted ? 'text-primary font-bold' : ''}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-outline-variant">{plan.period}</span>
                )}
              </div>
              <button
                disabled={plan.disabled}
                onClick={() => {
                  if (plan.name === '升學大師 Pro') handleUpgrade('pro');
                  else if (plan.name === '升學大師 Family') handleUpgrade('family');
                }}
                className={`w-full md:w-auto px-xl py-sm font-label-caps transition-all cursor-pointer ${
                  plan.disabled
                    ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                    : isActivated(plan)
                    ? 'bg-success text-white'
                    : plan.highlighted
                    ? 'bg-primary text-white hover:bg-primary-container'
                    : 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-on-primary'
                }`}
              >
                {getButtonLabel(plan)}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quote Section */}
      <div className="mt-xxl pt-xl border-t border-[#E9E5DB]">
        <div className="flex flex-col md:flex-row gap-xl items-center">
          <div className="w-full md:w-1/3">
            <div className="aspect-[4/5] bg-surface-variant overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
              <img
                alt="Architectural library with soft natural light"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfjYe_71WXVfIOPJwSGO3qY72-Qw_DgKKnSQYiDUB_vxutfPCOKS6YFGicGL6Lcy8vtScK36cc7dAIOxVjWtmSUcihTfIB19coKF9DkB3eY3RpJLHO2tdJbcQw7AofwgtM9GcA7dz4mKyUshGkoJo9w6l14kUQ-I4UwmOJUXex9a1umJ50LkAHhgATXcE2xvbPSs_JpyWGQtV7Tuu1sv36UZiL8mOvZAiAJzXT4lRm6hfWKOQX-oQQvh3AlKzIlXkZQ8PhdAg2iFpP"
              />
            </div>
          </div>
          <div className="w-full md:w-2/3 pl-0 md:pl-xl relative">
            <span className="material-symbols-outlined text-primary-fixed text-6xl absolute -top-8 -left-4 opacity-30">format_quote</span>
            <blockquote className="font-serif text-h2 italic text-on-surface-variant leading-relaxed mb-8 border-l-4 border-primary pl-8">
              教育不是注滿一桶水，而是點燃一火種。我們的定價方案旨在為每一位有抱負的靈魂提供最穩固的基石。
            </blockquote>
            <p className="font-label-caps text-primary">— 升學大師 首席學術顧問</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-[42rem] mx-auto mt-xxl">
        <h2 className="font-h2 text-on-background text-center mb-xl">常見問題</h2>
        <div className="space-y-md">
          {FAQS.map(faq => (
            <div key={faq.q} className="bg-surface-container-low border border-[#E9E5DB] p-lg">
              <h3 className="font-serif font-bold text-on-background mb-2">{faq.q}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-xxl">
        <p className="text-on-surface-variant font-body-md mb-lg">
          不確定哪個方案適合你？先從免費版開始。
        </p>
        <div className="flex flex-col sm:flex-row gap-md justify-center">
          <Link href="/onboarding/step1" className="bg-primary text-white px-xl py-sm font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all cursor-pointer">免費開始</Link>
          <Link href="/roadmap" className="border border-primary text-primary px-xl py-sm font-label-caps text-label-caps tracking-widest hover:bg-primary-fixed transition-all cursor-pointer">回到我的路線圖</Link>
        </div>
      </div>
    </div>
  );
}
