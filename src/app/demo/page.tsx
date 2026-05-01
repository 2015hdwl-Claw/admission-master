'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!schoolName || !contactName || !contactEmail) {
      setError('請填寫所有必填欄位');
      return;
    }
    if (!contactEmail.includes('@')) {
      setError('請輸入有效的 Email 格式');
      return;
    }
    setSubmitted(true);
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative mb-xxl">
        <div className="max-w-[1200px] mx-auto px-gutter py-xxl grid grid-cols-12 gap-gutter items-center">
          <div className="col-span-12 lg:col-span-5 z-10">
            <span className="font-label-caps text-primary mb-md block">EDUCATIONAL COLLABORATION</span>
            <h1 className="font-h1 text-h1 mb-lg leading-tight">
              學術精準，
              <br />
              <span className="italic">引領校園</span>新格局。
            </h1>
            <p className="font-body-lg text-on-surface-variant mb-xl max-w-[28rem]">
              升學大師致力於為頂尖學府提供結構化的升學導航方案，結合數據科學與建築思維，打造卓越的學術生態系。
            </p>
            <div className="flex gap-4">
              <a href="#apply" className="bg-[#7D8B7E] text-white px-8 py-3 font-label-caps tracking-widest hover:bg-primary transition-colors cursor-pointer">
                預約演示
              </a>
              <Link href="/pricing" className="border border-[#7D8B7E] text-[#7D8B7E] px-8 py-3 font-label-caps tracking-widest hover:bg-[#F4F1EA] transition-colors">
                下載簡介
              </Link>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-7 relative mt-12 lg:mt-0">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                alt="校園景觀"
                className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAdG17R8xUp7NKiV9X_wl97a6s7TLFdZAgEs3ChZLIVsfm8vj6NoBq8u98upNQFjd-ON2Ofh-GKEM0MkR-_krI8EMBsmfLziRBlCbSlJdccTbhXK1_G4joZpdOqkZqe2RfdXCDfWf2KFSCk0QjRcEQupkHwltS1jyCrPgslOIMt1mJF3DtqvsPRd_c8w0yuvKFBm8yvMHOGGPHEKT86IhI_uExKVvdQg0eO8FKM1gMOCxBI8ou69Ksh_pbPd6shawP_vqiCD1fiuHJ"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-surface-container p-xl hidden lg:block border border-[#E9E5DB]">
              <p className="font-h3 text-h3 text-primary mb-2">30+</p>
              <p className="font-label-caps text-on-surface-variant">合作重點中學</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section (Bento Grid) */}
      <section className="mb-xxl">
        <div className="max-w-[1200px] mx-auto px-gutter grid grid-cols-12 gap-gutter">
          <div className="col-span-12 md:col-span-4 bg-surface-container-low p-xl border border-[#E9E5DB] flex flex-col justify-between">
            <span className="font-h3 text-primary">01</span>
            <div>
              <h3 className="font-h2 text-h2 mb-4">92%</h3>
              <p className="text-on-surface-variant">學生在升學大師系統輔助下，成功進入其第一志願校系。</p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-8 bg-[#E9E5DB] p-xl flex flex-col justify-between relative overflow-hidden">
            <div className="z-10">
              <span className="font-h3 text-primary">02</span>
              <h3 className="font-h2 text-h2 mt-lg mb-4">數位化校務管理</h3>
              <p className="text-on-surface-variant max-w-[28rem]">
                專為校方行政團隊設計的後台系統，即時追蹤全校學生的學習歷程進度與潛在升學風險。
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
              <span className="material-symbols-outlined text-[300px]">analytics</span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-7 bg-surface-container-high p-xl border border-[#E9E5DB]">
            <span className="font-h3 text-primary">03</span>
            <h3 className="font-h2 text-h2 mt-lg mb-4">學術精準對接</h3>
            <p className="text-on-surface-variant">
              精確的數據分析，幫助校方在特色課程開發上與大學校系達成完美對接，提升學校品牌權威感。
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 bg-white p-xl border border-[#E9E5DB] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-primary text-3xl">handshake</span>
            </div>
            <p className="font-h3 text-h3 mb-2">深度戰略夥伴</p>
            <p className="text-on-surface-variant">與校方共同規劃未來三年的升學發展藍圖。</p>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="mb-xxl py-xl bg-[#F4F1EA] relative overflow-hidden">
        <div className="max-w-[800px] mx-auto px-gutter text-center relative z-10">
          <span className="material-symbols-outlined text-primary text-5xl mb-lg opacity-30 block">format_quote</span>
          <blockquote className="font-h2 text-h2 italic text-on-surface mb-xl leading-relaxed">
            &ldquo;升學大師不僅是一個工具，它更像是一位充滿智慧的導師。它將雜亂的升學資訊建築化，讓我們的學生能夠在清晰的框架下，穩健地邁向未來。&rdquo;
          </blockquote>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-md border-2 border-primary">
              <img
                alt="校長推薦"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaFu6x01KyA64Kfbl_0CkY8uWEr8tdYdHnRfDOgORXPHuc9WLbLXXW3xzO877Pf3kn1WyhAeKt1HaOJlb1NKKI_bqAqA6N4C-CDNHztGG7mIhzuZWPvcVBPoV5wsYZ_9gp6ZhefbzvPGmsX-LPQwHLmNn09JJytWcEEx_ExoFWdSTKT0oji8tx4Ff2JLKhrO8E-C3KdZ6DRsAt_4UwGqFi7zMYZ_KaFAv5S_nG5EtrjZGdVznwONPvbg7sTgpmzahgNcv0cmfYSvNo"
              />
            </div>
            <p className="font-label-caps text-primary tracking-widest">陳崇德</p>
            <p className="text-stone-500">國立師範大學附屬中學 校長</p>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="grid grid-cols-6 h-full gap-4">
            <div className="border-r border-primary h-full"></div>
            <div className="border-r border-primary h-full"></div>
            <div className="border-r border-primary h-full"></div>
            <div className="border-r border-primary h-full"></div>
            <div className="border-r border-primary h-full"></div>
            <div></div>
          </div>
        </div>
      </section>

      {/* Case Study List */}
      <section className="mb-xxl">
        <div className="max-w-[1200px] mx-auto px-gutter">
          <h2 className="font-h2 text-h2 mb-xl border-l-4 border-primary pl-md">經典合作案例</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="group cursor-pointer">
              <div className="aspect-square overflow-hidden mb-md">
                <img
                  alt="合作案例 1"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxUcG3zDhW_yqr8nNoca7PKAy83BXtkCS0w4o5yCY39QdtdQqaW3KeXMfcAUDJ1WDArZ6Bddz9SOKQ_ne5om0ntV2C0Uj3vwpML-cpXPdnwkmHKkNEscAKcPpoj3GuYdnS6uVop8gY_9ts7gXZmIHpprMFSjm442knlpHCdwRp19GK4k6SIZWOr4dkHlNah0W4_tQhA0-pTh1E4GXYGQm_NAWkZaVC-0xLKmw_Qlj9dITtKW0buFZbLsSkWSH0CfuH0gWvbeydmRkW"
                />
              </div>
              <p className="font-label-caps text-primary mb-2">台北市立第一女子高級中學</p>
              <h3 className="font-h3 text-h3 mb-md">跨校資源共享平台建置</h3>
              <p className="text-on-surface-variant text-sm">導入數位檔案評量系統，有效縮短教師審閱學習歷程時間達 40%。</p>
            </div>
            <div className="group cursor-pointer">
              <div className="aspect-square overflow-hidden mb-md">
                <img
                  alt="合作案例 2"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY9o62iKl6jcsaSgSISLc0tkDYG3I6TjY6hUcrf6P00lLPrRs1_tua6L3wPATpPHAdO1o6ZR5P7_A99SqFUX0tVgz0RIRqrYPboW-2S6-AsPiyCM2nhcEkV53vHxqsA2cAPTKazFhf0PMI4slptjO3BwJDYXSRnJhTYDbez-EZf2AHoUjZ7hiJJFuQU3buMz5lR88Te0gIA0Bl_as-jnuVfMYX5r3Phh6kyQzZKRN9cACS8Z2PqVqCu2dgv-S0RImfBDDb0qTYGgvi"
                />
              </div>
              <p className="font-label-caps text-primary mb-2">國立台中第一高級中等學校</p>
              <h3 className="font-h3 text-h3 mb-md">AI 升學決策支援系統</h3>
              <p className="text-on-surface-variant text-sm">利用大數據分析，為數理資優班學生提供更精確的海外升學諮詢方案。</p>
            </div>
            <div className="group cursor-pointer">
              <div className="aspect-square overflow-hidden mb-md">
                <img
                  alt="合作案例 3"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAREz8oFxso2mra7OLteOHPxakeRG3mktwpB-z_iyoj8xfGFnzOJ0AoBXPVK_jH_YbWrW3HR7QzU8Dd5wAAtgedRfEI8brbkVe9ZBYW9oGJOz2qal00r7nQlaJgNkBwxxwolpWOpQogzV72ztUr9q3UhJYFvRR2ex3hh4X_8rifERCV88PYvraTOCfQmdF0BF3YLnFAUazWLHoYkLVpYP6IzenoXBgYxWrfbZx2fi9KDpPnfVdKusnK8xjb4UszfmX0X04jWesbLQ8j"
                />
              </div>
              <p className="font-label-caps text-primary mb-2">高雄市立高雄高級中學</p>
              <h3 className="font-h3 text-h3 mb-md">職涯性向深度對接計劃</h3>
              <p className="text-on-surface-variant text-sm">結合心理測驗與實際職群訪談，協助高一新生建立清晰的生涯藍圖。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Form */}
      <section id="apply" className="bg-[#7D8B7E] p-xl md:p-xxl text-white">
        <div className="max-w-[1200px] mx-auto">
          {!submitted ? (
            <div className="text-center mb-xl">
              <h2 className="font-h1 text-h1 mb-lg">開啟校園卓越新篇章</h2>
              <p className="font-body-lg mb-xl opacity-90 max-w-[42rem] mx-auto">
                誠摯邀請您的學校團隊參與我們的合作演示，體驗「升學大師」如何協助貴校學生掌握未來競爭力。
              </p>
            </div>
          ) : null}

          {!submitted ? (
            <div className="max-w-[900px] mx-auto">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8">
                <h3 className="font-serif text-xl font-bold text-center mb-6">申請免費試用</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label htmlFor="school-name" className="block text-xs font-label-caps tracking-widest mb-2 opacity-80">學校名稱 *</label>
                      <input
                        id="school-name"
                        type="text"
                        value={schoolName}
                        onChange={e => setSchoolName(e.target.value)}
                        placeholder="例如：台北市立松山工農"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none focus:border-white/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-label-caps tracking-widest mb-2 opacity-80">聯絡人姓名 *</label>
                      <input
                        id="contact-name"
                        type="text"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="例如：王主任"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none focus:border-white/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-label-caps tracking-widest mb-2 opacity-80">聯絡 Email *</label>
                      <input
                        id="contact-email"
                        type="email"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="teacher@school.edu.tw"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none focus:border-white/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="student-count" className="block text-xs font-label-caps tracking-widest mb-2 opacity-80">預估學生人數</label>
                      <select
                        id="student-count"
                        value={studentCount}
                        onChange={e => setStudentCount(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white outline-none focus:border-white/50 transition-colors appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 12 12%27%3E%3Cpath fill=%27none%27 stroke=%27rgba(255,255,255,0.5)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpolyline points=%272 4 6 8 10%27/%3E%3C/svg%3E')] bg-no-repeat bg-[center_right_1rem_center]"
                      >
                        <option value="" className="text-on-background">請選擇</option>
                        <option value="1-50" className="text-on-background">1-50 人</option>
                        <option value="51-200" className="text-on-background">51-200 人</option>
                        <option value="201-500" className="text-on-background">201-500 人</option>
                        <option value="500+" className="text-on-background">500 人以上</option>
                      </select>
                    </div>
                  </div>
                  {error && <p className="text-sm bg-error-container text-error rounded-sm p-3">{error}</p>}
                  <button
                    type="submit"
                    className="w-full bg-white text-primary px-8 py-4 font-label-caps tracking-widest hover:bg-[#F4F1EA] transition-colors cursor-pointer"
                  >
                    提交申請
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center">
              <div className="mb-4">
                <span className="material-symbols-outlined text-[48px] opacity-90">check_circle</span>
              </div>
              <h3 className="font-h2 text-h2 mb-4">申請已送出</h3>
              <p className="opacity-90 mb-4">
                我們會在 3 個工作天內聯繫 {contactName}，討論試用方案。
              </p>
              <p className="text-sm opacity-70">學校：{schoolName}</p>
              <div className="mt-8">
                <Link href="/" className="text-white hover:text-white border-b border-white/50 text-sm font-medium">
                  ← 返回首頁
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Links */}
      <div className="text-center py-xl">
        <div className="flex justify-center gap-8">
          <Link href="/teacher" className="text-primary hover:text-primary text-sm font-medium">教師 Dashboard</Link>
          <Link href="/pricing" className="text-on-surface-variant hover:text-on-background text-sm">查看定價方案</Link>
        </div>
      </div>
    </div>
  );
}
